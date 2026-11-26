import assert from "node:assert/strict";
import { getTeamFileNames, read } from "../roster-data.mjs";
import {
  createDefensiveGroups,
  DEFENSIVE_STARTER_COUNT,
  DEFENSIVE_UNITS,
} from "../../../lib/teams/calculate-ratings.mts";

// Independent specification: each of the eleven named starters contributes equally.
const starters = ["RE", "NT", "LE", "ROLB", "RILB", "LILB", "LOLB", "RCB", "LCB", "FS", "SS"];
assert.deepEqual(Object.values(DEFENSIVE_UNITS).flatMap(unit => unit.positions).sort(), [...starters].sort());

// Multiplying each unit mean by its starter count recovers the unit's sum.
for (const [unit, { positions, weight }] of Object.entries(DEFENSIVE_UNITS)) {
  assert(positions.length > 0, `${unit}: cannot average an empty unit`);
  assert.equal(weight, positions.length, `${unit}: weight must equal starter count`);
}
assert.equal(DEFENSIVE_STARTER_COUNT, starters.length, "Defensive rating divisor must equal the eleven-starter count");

// Exercise the floating-point generator and roster selection on the actual inputs.
const files = getTeamFileNames();
assert.equal(files.length, 28, "Expected all 28 team rosters");
for (const file of files) {
  const { players } = read(file);
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
