import { rejectCounterexample } from "../reject-counterexample.mjs";
import assert from "node:assert/strict";
import { read } from "../roster-data.mjs";
import { init } from "z3-solver";
import { getRankedTeamRows, getTeamRatingSummaries } from "../../../lib/teams/ratings.ts";
import { getTeamFileNames } from "../../rebuild/team-ratings.ts";

const summaryKeys = ["overall_rating", "offensive_rating", "defensive_rating"];
const keys = [...summaryKeys, "running_offense", "passing_offense", "balanced_offense", "dl_group", "lb_group", "secondary_group"];
const teams = read("team-ratings.json");
const ids = teams.map(team => team.team).sort();
assert(teams.length > 0);
assert.deepEqual(ids, getTeamFileNames().map(file => file.slice(0, -5)).sort());

// Use English collation to assign alphabetical ordinals independently of the
// production comparator. The actual names must be distinct under this collation.
const collator = new Intl.Collator("en");
const alphabetical = [...teams].sort((a, b) => collator.compare(a.full_name, b.full_name));
const names = new Map(alphabetical.map((team, index) => [team.team, index]));
for (let i = 1; i < alphabetical.length; i++) {
  assert(collator.compare(alphabetical[i - 1].full_name, alphabetical[i].full_name) < 0);
}

const { Context } = await init();
const { And, Or, Not, Real, Int, Solver } = new Context("team_rankings");
function precedes(a, b, direction) {
  const better = direction === "desc" ? a.score.gt(b.score) : a.score.lt(b.score);
  return Or(better, And(a.score.eq(b.score), a.name.lt(b.name)));
}

const [a, b, c] = ["a", "b", "c"].map(id => ({ score: Real.const(id + "_score"), name: Int.const(id + "_name") }));
const summaries = new Map(teams.map(team => [team.team, getTeamRatingSummaries(teams, team.team)]));
for (const items of summaries.values()) assert.deepEqual(items.map(item => item.key), summaryKeys);

for (const direction of ["desc", "asc"]) {
  const ab = precedes(a, b, direction);
  const ba = precedes(b, a, direction);
  await rejectCounterexample(Solver, Or(precedes(a, a, direction), And(ab, ba), And(a.name.neq(b.name), Not(Or(ab, ba))),
    And(ab, precedes(b, c, direction), Not(precedes(a, c, direction)))),
  `Invalid ${direction} ordering`);

  for (const key of keys) {
    const value = team => summaryKeys.includes(key) ? team[key] : team.components[key];
    for (const team of teams) assert(Number.isFinite(value(team)), `${team.team}: invalid ${key}`);
    const ranked = getRankedTeamRows(teams, key, direction);
    assert.deepEqual(ranked.map(row => row.team.team).sort(), ids);
    const inversions = [];
    const witness = Int.const("second_row_of_inversion");
    let previous;
    for (const [i, { team, rank }] of ranked.entries()) {
      const score = value(team);
      const current = { score: Real.val(String(score)), name: Int.val(names.get(team.team)) };
      if (previous) inversions.push(And(witness.eq(i + 1), Not(precedes(previous, current, direction))));
      previous = current;

      const higher = teams.filter(other => value(other) > score).length;
      const ties = teams.filter(other => value(other) === score);
      const earlier = ties.filter(other => names.get(other.team) < names.get(team.team)).length;
      const canonical = 1 + higher + earlier;
      assert.equal(rank, canonical, `${direction} ${key}: ${team.team} rank`);
      if (direction === "desc" && summaryKeys.includes(key)) {
        const item = summaries.get(team.team).find(item => item.key === key);
        assert.equal(item.rating, score, `${team.team}: ${key} summary rating`);
        assert.equal(item.rank, canonical, `${team.team}: ${key} summary rank`);
      }
    }
    if (inversions.length) await rejectCounterexample(Solver, Or(...inversions), `${direction} ${key}: out-of-order teams`);

    // Exercise every column's exact tie rule even if today's scores are distinct.
    const forcedTies = alphabetical.toReversed().map(team => ({
      ...team, ...(summaryKeys.includes(key) ? { [key]: 50 } : { components: { ...team.components, [key]: 50 } }),
    }));
    assert.deepEqual(getRankedTeamRows(forcedTies, key, direction).map(({ team, rank }) => [team.team, rank]),
      alphabetical.map((team, i) => [team.team, i + 1]), `${direction} ${key}: equal scores must keep alphabetical ranks`);
  }
}
console.log(`Verified ${teams.length * keys.length * 2} table ranks and ${teams.length * summaryKeys.length} summary ranks across ${teams.length} teams.`);
