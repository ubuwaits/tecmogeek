import { expectedWeights, skillHP, lineHP, defenseHP } from "./rating-spec.mjs";
import { positionEntries } from "../../../lib/players/leaderboard.ts";
import assert from "node:assert/strict";
import { getTeamFileNames, indexPlayers, key, positions, readRosterPlayers, skillPositions } from "../roster-data.mjs";
import { init } from "z3-solver";
import { POSITION_PAGES } from "../../../lib/players/config.ts";
import * as offense from "../../rebuild/offensive-ratings.mjs";
import { DEFENSIVE_HP_SCORE_MAP } from "../../../lib/players/metrics.ts";
import * as defense from "../../rebuild/defensive-ratings.mjs";

const { Context } = await init();
const { Int, Real, ToInt, ToReal, Solver, Sum, If, Or, substitute, simplify } = new Context("players");

const models = new Map();
for (const config of [...offense.SKILL_CONFIGS, offense.OL_CONFIG]) {
  models.set(config.slug, { config, engine: offense, ladder: config.hittingPowerScores,
    specLadder: config.slug === "ol" ? lineHP : skillHP });
}
for (const config of defense.DEFENSIVE_CONFIGS) {
  models.set(config.slug, { config, engine: defense, ladder: DEFENSIVE_HP_SCORE_MAP, specLadder: defenseHP });
}

function ladderScore(raw, ladder) {
  return Object.entries(ladder).reduce((score, [value, points]) =>
    If(raw.eq(Number(value)), Int.val(points), score), Int.val(0));
}

// Use the observed positional maxima. All raw attributes are symbolic integers,
// including HP values absent from the ladders, which contribute zero.
async function prove(page, model, maxima) {
  const raw = new Map(page.columns.map(({ key }) => [key, Int.const(key)]));
  const solver = new Solver();
  try {
    for (const [key, term] of raw) {
      solver.add(term.ge(0), term.le(key === "hitting_power" ? 100 : maxima[key]));
    }
    function term({ key, weight }, ladder) {
      const value = raw.get(key);
      assert(value, `${page.slug}: unknown formula input ${key}`);
      const numerator = key === "hitting_power" ? ladderScore(value, ladder) : value;
      const denominator = key === "hitting_power" ? 100 : maxima[key];
      return denominator === 0 ? Real.val(0) : ToReal(numerator).mul(weight).div(denominator);
    }
    const spec = Sum(...Object.entries(expectedWeights[page.slug]).map(([key, weight]) => term({ key, weight }, model?.specLadder)));
    const columns = model?.config.columns ?? page.columns;
    const formula = Sum(...columns.map(column => term(column, model?.ladder)));
    const rounded = ToInt(formula.add(Real.val("1/2")));
    // A whole-percent rating r is correct iff r - 1/2 <= spec < r + 1/2.
    solver.add(Or(formula.neq(spec), rounded.lt(0), rounded.gt(100),
      ToReal(rounded).sub(Real.val("1/2")).gt(spec), ToReal(rounded).add(Real.val("1/2")).le(spec),
      spec.lt(0), spec.gt(100)));
    const result = await solver.check();
    if (result !== "unsat") throw new Error(`${page.slug}: ${result === "sat" ? solver.model() : solver.reasonUnknown()}`);
    return { raw, rounded };
  } finally {
    solver.release();
  }
}

const files = getTeamFileNames();
const roster = files.flatMap(file => {
  const players = readRosterPlayers(file);
  for (const [position, field] of [["RT", "kick_return_maximum_speed"], ["SS", "punt_return_maximum_speed"]]) {
    const starters = players.filter(player => player.position === position);
    assert.equal(starters.length, 1, `${file}: expected one ${position}`);
    for (const player of players.filter(player => skillPositions.test(player.position))) {
      assert.equal(player[field], starters[0].maximum_speed, `${file}: ${key(player)} ${field}`);
    }
  }
  return players;
});
assert(roster.length > 0);
const unclassified = new Set(indexPlayers(roster, "team rosters").keys());
const errors = [];
let count = 0;
for (const page of POSITION_PAGES) {
  assert.deepEqual(page.columns.map(({ key, weight }) => [key, weight]), Object.entries(expectedWeights[page.slug]),
    `${page.slug}: displayed weights differ from the published formula`);
  const eligible = roster.filter(player => positions[page.slug].test(player.position));
  assert(eligible.length > 0, `Empty group: ${page.slug}`);
  const rows = positionEntries(roster, page);
  const indexed = indexPlayers(rows, page.slug);
  assert.deepEqual(new Set(indexed.keys()), new Set(eligible.map(key)), `Coverage mismatch in ${page.slug}`);

  const maxima = {};
  for (const { key: field } of page.columns) {
    for (const player of eligible) {
      const value = player[field];
      assert(Number.isInteger(value) && value >= 0 && value <= 100, `${key(player)}: invalid ${field}=${value}`);
    }
    if (field !== "hitting_power") maxima[field] = Math.max(...eligible.map(player => player[field]));
  }

  const model = models.get(page.slug);
  if (model) {
    assert.deepEqual(model.engine.buildMaxima(rows, model.config.columns), maxima);
  }
  const { raw, rounded } = await prove(page, model, maxima);
  for (const player of eligible) {
    const concrete = substitute(rounded, ...Array.from(raw, ([field, variable]) => [variable, Int.val(player[field])]));
    const rating = Number((await simplify(concrete)).toString());
    assert(Number.isInteger(rating));
    unclassified.delete(key(player));
    if (player[page.ratingKey] !== rating + "%") errors.push(`${key(player)} ${page.ratingKey}=${player[page.ratingKey]}, expected ${rating}%`);
    if (model) {
      const rebuilt = model.engine.computeRating(player, model.config.columns, maxima, model.ladder);
      if (rebuilt !== rating) errors.push(`${page.slug}: ${key(player)} rebuild gives ${rebuilt}, exact formula gives ${rating}`);
    }
  }
  console.log(`${page.slug}: proved formula bounds and rounding, evaluated ${eligible.length} ratings.`);
  count += eligible.length;
}

assert.deepEqual([...unclassified], [], "Unclassified roster players");
if (errors.length) throw new Error(errors.join("\n"));
console.log(`Verified ${count} ratings for ${roster.length} players across ${files.length} teams and all ${POSITION_PAGES.length} leaderboards.`);
