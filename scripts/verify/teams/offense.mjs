import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { init } from "z3-solver";
import {
  buildTeamRatingRecord, calculateTeamOffenseAndOverall, createOffensiveSkillLineups, getTeamFileNames,
} from "../../rebuild/team-ratings.ts";

const { Context } = await init();
const { Real, Solver, Sum, Or } = new Context("offense");
const inputs = Object.fromEntries(["runningSkill", "passingSkill", "balancedSkill", "line", "qb", "returns", "defense"]
  .map(key => [key, Real.const(key)]));
const actual = calculateTeamOffenseAndOverall(inputs, parts =>
  Sum(...parts.map(({ weight, value }) => value.mul(Real.val(String(weight))))));

const { runningSkill, passingSkill, balancedSkill, line, qb, returns, defense } = inputs;
// Integer coefficients from docs/team-ratings.md. Expand the 25/25/50 offense
// blend to independently specify the contribution of each underlying input.
const running = Sum(runningSkill.mul(63), line.mul(27), returns.mul(10)).div(100);
const passing = Sum(qb.mul(450), passingSkill.mul(315), line.mul(135), returns.mul(100)).div(1000);
const balanced = Sum(qb.mul(27), line.mul(18), balancedSkill.mul(45), returns.mul(10)).div(100);
const offense = Sum(runningSkill.mul(630), passingSkill.mul(315), balancedSkill.mul(900),
  line.mul(765), qb.mul(990), returns.mul(400)).div(4000);
const overall = offense.add(defense).div(2);
const spec = { runningOffenseRating: running, passingOffenseRating: passing, balancedOffenseRating: balanced,
  offensiveRating: offense, overallRating: overall };

const solver = new Solver();
try {
  for (const input of Object.values(inputs)) solver.add(input.ge(0), input.le(100));
  const violations = Object.entries(spec).flatMap(([key, expected]) =>
    [actual[key].neq(expected), actual[key].lt(0), actual[key].gt(100)]);
  solver.add(Or(...violations));
  const result = await solver.check();
  if (result === "unknown") throw new Error(`Inconclusive: ${solver.reasonUnknown()}`);
  if (result === "sat") throw new Error(`Formula counterexample: ${solver.model()}`);
  console.log("Proved all five unrounded formulas equal the specification and stay in [0, 100].");
} finally {
  solver.release();
}

function readData(file) {
  return JSON.parse(readFileSync(new URL("../../../data/" + file, import.meta.url), "utf8"));
}

function rating(player, field) {
  const raw = player[field];
  assert(/^\d+(?:\.\d+)?%?$/.test(String(raw)), `Invalid ${field} for ${player.name}: ${raw}`);
  const value = Number.parseFloat(raw);
  assert(value <= 100);
  return value;
}

function starterMean(players, positions) {
  return positions.reduce((sum, pos) => {
    const matches = players.filter(player => player.position === pos);
    assert.equal(matches.length, 1, `Expected one ${pos}`);
    return sum + rating(matches[0], "rating");
  }, 0) / positions.length;
}

function bestTwo(players, field) {
  const sorted = players.map(player => rating(player, field)).sort((a, b) => b - a);
  assert(sorted.length >= 2);
  return sorted;
}

function verifyTeam(team, roster, published) {
  const players = roster.players;
  const skillPlayers = players.filter(player => /^(RB|WR|TE)/.test(player.position));
  const [starter, backup] = bestTwo(players.filter(player => player.position.startsWith("QB")), "rating");
  const qb = (4 * starter + backup) / 5;
  const [kr1, kr2] = bestTwo(skillPlayers, "kick_return_rating");
  const [pr1, pr2] = bestTwo(skillPlayers, "punt_return_rating");
  const returns = (55 * (3 * kr1 + kr2) + 45 * (3 * pr1 + pr2)) / 400;
  const line = starterMean(players, ["C", "LG", "RG", "LT", "RT"]);
  const defense = starterMean(players, ["RE", "NT", "LE", "ROLB", "RILB", "LILB", "LOLB", "RCB", "LCB", "FS", "SS"]);
  const skill = createOffensiveSkillLineups(players);
  const run = (63 * skill.runningSkillRating + 27 * line + 10 * returns) / 100;
  const pass = (450 * qb + 315 * skill.passingSkillRating + 135 * line + 100 * returns) / 1000;
  const balanced = (27 * qb + 18 * line + 45 * skill.balancedSkillRating + 10 * returns) / 100;
  const offense = (run + pass + 2 * balanced) / 4;
  const expected = { running_offense: run, passing_offense: pass, balanced_offense: balanced,
    offensive_rating: offense, overall_rating: (offense + defense) / 2 };

  const generated = buildTeamRatingRecord(team, roster);
  for (const [field, value] of Object.entries(expected)) {
    const score = generated[field] ?? generated.components[field];
    assert.equal(score, published[field] ?? published.components[field], `${team}: published ${field} differs from generator`);
    assert.equal(score, Number(score.toFixed(3)), `${team}: ${field} exceeds three decimal places`);
    // At an exact half-thousandth, binary floating point may round to either neighbor.
    assert(Math.abs(score - value) <= 0.0005 + 1e-12, `${team}: ${field} is ${score}, expected ${value} before rounding`);
  }
}

const files = getTeamFileNames();
const records = readData("team-ratings.json");
assert(files.length > 0);
assert.deepEqual(records.map(record => record.team).sort(), files.map(file => file.slice(0, -5)).sort());
const byTeam = new Map(records.map(record => [record.team, record]));
for (const file of files) {
  const team = file.slice(0, -5);
  verifyTeam(team, readData(file), byTeam.get(team));
}
console.log(`Verified five generated and published ratings for each of ${files.length} teams.`);
