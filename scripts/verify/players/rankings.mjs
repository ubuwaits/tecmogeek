import { verifiedLeaderboards } from "./membership.mjs";
import { rejectCounterexample } from "../reject-counterexample.mjs";
import assert from "node:assert/strict";
import { init } from "z3-solver";
import { POSITION_PAGES } from "../../../lib/players/config.ts";
import { getTeamFileNames, key, readRosterPlayers } from "../roster-data.mjs";
import { rankPositionPlayers } from "../../rebuild/rank-position-players.mjs";

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
let count = 0;
for (const { page, rows } of verifiedLeaderboards(roster, POSITION_PAGES)) {
  let previous;
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
    if (previous) {
      assert(previous.primary > primary || (previous.primary === primary && previous.secondary >= secondary),
        `${page.slug}: ${previous.id} precedes ${id} with a lower ranking input`);
    }
    previous = { primary, secondary, id };
    assert.equal(player[page.rankingKey], i + 1, `${id} ${page.rankingKey}`);
  }
  count += rows.length;
}

console.log(`Verified ${count} rankings for ${roster.length} players across ${teamFiles.length} teams and ${POSITION_PAGES.length} leaderboards.`);
