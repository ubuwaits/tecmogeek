import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { init } from "z3-solver";
import {
  createDefensiveGroups,
  DEFENSIVE_STARTER_COUNT,
  DEFENSIVE_UNITS,
  getTeamFileNames,
} from "./rebuild-team-ratings.ts";

// Independent specification: each of the eleven named starters contributes equally.
const starters = ["RE", "NT", "LE", "ROLB", "RILB", "LILB", "LOLB", "RCB", "LCB", "FS", "SS"];
const { Context } = await init();
const { Real, Solver, Sum, Or } = new Context("defense");
const ratings = new Map(starters.map(position => [position, Real.const(position)]));
const units = Object.values(DEFENSIVE_UNITS);
assert.deepEqual(units.flatMap(unit => unit.positions).sort(), [...starters].sort());

const weightedUnits = units.map(({ positions, weight }) =>
  Sum(...positions.map(position => ratings.get(position))).div(positions.length).mul(weight));
const score = Sum(...weightedUnits).div(DEFENSIVE_STARTER_COUNT);
const mean = Sum(...ratings.values()).div(starters.length);
const solver = new Solver();
try {
  for (const rating of ratings.values()) solver.add(rating.ge(0), rating.le(100));
  solver.add(Or(score.neq(mean), score.lt(0), score.gt(100)));
  const result = await solver.check();
  if (result === "sat") throw new Error(`Defensive formula counterexample: ${solver.model()}`);
  if (result === "unknown") throw new Error(`Inconclusive: ${solver.reasonUnknown()}`);
  console.log("Proved the unrounded defensive formula equals the eleven-starter mean and stays in [0, 100].");
} finally {
  solver.release();
}

// Exercise the floating-point generator and roster selection on the actual inputs.
const files = getTeamFileNames();
assert(files.length > 0, "No team rosters found");
for (const file of files) {
  const { players } = JSON.parse(readFileSync(new URL("../data/" + file, import.meta.url), "utf8"));
  const values = starters.map(position => {
    const matches = players.filter(player => player.position === position);
    assert.equal(matches.length, 1, `${file}: expected exactly one ${position}`);
    const raw = matches[0].rating;
    assert(/^\d+(?:\.\d+)?%?$/.test(String(raw)), `${file}: invalid ${position} rating ${raw}`);
    const rating = Number.parseFloat(raw);
    assert(rating <= 100, `${file}: ${position} rating exceeds 100`);
    return rating;
  });
  const expected = values.reduce((sum, value) => sum + value, 0) / starters.length;
  const actual = createDefensiveGroups(players).score;
  assert(Math.abs(actual - expected) <= 1e-9, `${file}: generated ${actual}, expected ${expected}`);
}
console.log(`Verified the generated defensive score for all ${files.length} teams.`);
