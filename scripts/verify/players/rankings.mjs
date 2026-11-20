import { positionEntries } from "../../../lib/players/leaderboard.ts";
import { rejectCounterexample } from "../reject-counterexample.mjs";
import assert from "node:assert/strict";
import { init } from "z3-solver";
import { POSITION_PAGES } from "../../../lib/players/config.ts";
import { getTeamFileNames } from "../../rebuild/team-ratings.ts";
import { indexPlayers, key, positions, readRosterPlayers } from "../roster-data.mjs";
import { rankPositionPlayers } from "../../rebuild/rank-position-players.mjs";
import { comparePlayerRanks } from "../../rebuild/compare-player-ranks.mjs";

const { Context } = await init();
const { Int, Or, And, Not, Solver } = new Context("player_rankings");

// Higher primary and secondary values precede lower ones. For complete ties,
// the category's previous rank determines order.
function precedes(a, b) {
  return Or(a.primary.gt(b.primary), And(a.primary.eq(b.primary),
    Or(a.secondary.gt(b.secondary), And(a.secondary.eq(b.secondary), a.index.lt(b.index)))));
}

function symbolicPlayer(name) {
  return { primary: Int.const(name + "_primary"), secondary: Int.const(name + "_secondary"), index: Int.const(name + "_index") };
}
const [a, b, c] = ["a", "b", "c"].map(symbolicPlayer);
const ab = precedes(a, b);
const ba = precedes(b, a);
await rejectCounterexample(Solver, Or(precedes(a, a), And(ab, ba),
  And(a.index.neq(b.index), Not(Or(ab, ba))),
  And(ab, precedes(b, c), Not(precedes(a, c)))), "Ranking is not a strict total order");

// Exercise all relative orderings of the three keys through the rebuild comparator,
// including a rating and hitting-power tie in either source order.
for (const rating of [-1, 0, 1]) {
  for (const hp of [-1, 0, 1]) {
    for (const index of [-1, 0, 1]) {
      const left = { rating, hittingPower: hp, previousRank: index };
      const right = { rating: 0, hittingPower: 0, previousRank: 0 };
      const observed = comparePlayerRanks(left, right);
      await rejectCounterexample(Solver, And(
        a.primary.sub(b.primary).eq(rating), a.secondary.sub(b.secondary).eq(hp), a.index.sub(b.index).eq(index),
        observed < 0 ? Not(ab) : observed > 0 ? Not(ba) : Or(ab, ba),
      ), "Rebuild comparator disagrees with ranking rule");
    }
  }
}

// Roster order can disagree with either leaderboard. On a full tie each
// rebuild must use that category's own previous ranks before overwriting them.
const tied = [
  { hitting_power: 50, rushing_ranking: 90, receiving_ranking: 10 },
  { hitting_power: 50, rushing_ranking: 10, receiving_ranking: 90 },
];
for (const category of ["rushing", "receiving"]) {
  rankPositionPlayers(tied, () => 75, category + "_rating", category + "_ranking");
}
assert.deepEqual(tied.map(p => [p.rushing_ranking, p.receiving_ranking]), [[2, 1], [1, 2]]);

const teamFiles = getTeamFileNames();
const roster = teamFiles.flatMap(readRosterPlayers);
const unclassified = new Set(indexPlayers(roster, "team rosters").keys());
let count = 0;
for (const page of POSITION_PAGES) {
  const rows = positionEntries(roster, page);
  const eligible = roster.filter(player => positions[page.slug].test(player.position));
  assert(rows.length > 0, `Empty group: ${page.slug}`);
  assert.deepEqual(new Set(indexPlayers(rows, page.slug).keys()), new Set(eligible.map(key)), page.slug);
  const violations = [];
  let previous;
  const witness = Int.const("row_with_inversion");
  for (const [i, player] of rows.entries()) {
    const id = key(player);
    const rating = player[page.ratingKey];
    assert(/^(100|[1-9]?\d)%$/.test(rating), `${id}: invalid ${page.ratingKey}`);
    let primary = Number.parseInt(rating, 10);
    let secondary = 0;
    if (page.slug === "k" || page.slug === "p") {
      primary = player.kicking_ability;
    } else if (page.slug !== "qb") {
      secondary = player.hitting_power;
    }
    assert(Number.isInteger(primary) && Number.isInteger(secondary), `${id}: invalid ranking input`);
    const current = { primary: Int.val(primary), secondary: Int.val(secondary), index: Int.val(i) };
    if (previous) violations.push(And(witness.eq(i + 1), Not(precedes(previous, current))));
    previous = current;
    assert.equal(player[page.rankingKey], i + 1, `${id} ${page.rankingKey}`);
    unclassified.delete(id);
  }
  // Transitivity makes adjacent comparisons sufficient for the entire file.
  if (violations.length) await rejectCounterexample(Solver, Or(...violations), `Out-of-order players in ${page.slug}`);
  count += rows.length;
}

assert.deepEqual([...unclassified], [], "Unclassified roster players");
console.log(`Verified ${count} rankings for ${roster.length} players across ${teamFiles.length} teams and ${POSITION_PAGES.length} leaderboards.`);
