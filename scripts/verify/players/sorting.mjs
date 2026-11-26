import { verifiedLeaderboards } from "./membership.mjs";
import { rejectCounterexample } from "../reject-counterexample.mjs";
import assert from "node:assert/strict";
import { init } from "z3-solver";
import { sortEntriesByKey } from "../../../lib/players/sort.ts";
import { POSITION_PAGES } from "../../../lib/players/config.ts";
import { getTeamFileNames, key, readRosterPlayers } from "../roster-data.mjs";

const { Context } = await init();
const { Int, Or, And, Solver, Not } = new Context("player_sorting");

// Model the signs of (left - right) for the selected value, canonical rank,
// and input position. Only these three comparisons can affect the ordering.
function precedes(value, rank, position, direction) {
  const asc = direction === "asc";
  return Or(asc ? value.lt(0) : value.gt(0), And(value.eq(0),
    Or(asc ? rank.gt(0) : rank.lt(0), And(rank.eq(0), position.lt(0)))));
}

async function proveOrderingRule(direction) {
  const delta = ["value", "rank", "position"].map(name => Int.const(name));
  const next = ["nextValue", "nextRank", "nextPosition"].map(name => Int.const(name));
  const before = precedes(...delta, direction);
  const after = precedes(...delta.map(x => x.neg()), direction);
  // For any two distinct rows exactly one precedes the other. For three rows,
  // (a - c) = (a - b) + (b - c) in each coordinate.
  const violation = Or(And(before, after), And(delta[2].neq(0), Not(Or(before, after))),
    And(before, precedes(...next, direction), Not(precedes(...delta.map((x, i) => x.add(next[i])), direction))));
  await rejectCounterexample(Solver, violation, `Invalid ${direction} player sort order`);
}

function numeric(player, field) {
  const raw = player[field];
  assert(typeof raw === "number" || /^\d+(\.\d+)?%?$/.test(raw), `${key(player)}: invalid ${field}`);
  const value = Number(String(raw).replace(/%$/, ""));
  assert(Number.isFinite(value), `${key(player)}: nonfinite ${field}`);
  return value;
}

function checkSort(rows, field, rankField, direction, description) {
  const index = new Map(rows.map((row, i) => [row, i]));
  const sorted = sortEntriesByKey(Object.freeze([...rows]), field, direction, rankField);
  assert.deepEqual(new Set(sorted), new Set(rows), description + ": changed membership");
  assert.equal(sorted.length, rows.length, description + ": changed length");
  for (let i = 1; i < sorted.length; i++) {
    const left = sorted[i - 1];
    const right = sorted[i];
    const valueDifference = numeric(left, field) - numeric(right, field);
    const rankDifference = numeric(left, rankField) - numeric(right, rankField);
    const pair = `${description} ${field} ${direction}: ${key(left)} precedes ${key(right)} at row ${i}`;
    if (valueDifference !== 0) {
      assert(direction === "asc" ? valueDifference < 0 : valueDifference > 0, pair + ": incorrect value order");
    } else if (rankDifference !== 0) {
      assert(direction === "asc" ? rankDifference > 0 : rankDifference < 0, pair + ": incorrect rank tie-break");
    } else {
      assert(index.get(left) < index.get(right), pair + ": full tie changed input order");
    }
  }
}

const directions = ["asc", "desc"];
for (const direction of directions) await proveOrderingRule(direction);
const roster = getTeamFileNames().flatMap(readRosterPlayers);
let orders = 0;
let placements = 0;
for (const { page, rows } of verifiedLeaderboards(roster, POSITION_PAGES)) {
  const fields = [page.rankingKey, page.ratingKey, ...page.columns.map(column => column.key)];
  const filters = page.filters ?? [{ id: "all", allowedPrefixes: [] }];
  for (const { id, allowedPrefixes } of filters) {
    const subset = rows.filter(row => !allowedPrefixes.length || allowedPrefixes.some(prefix => row.position.startsWith(prefix)));
    assert(subset.length > 0);
    for (const field of fields) for (const direction of directions) {
      checkSort(subset, field, page.rankingKey, direction, page.slug + "/" + id);
      // Leaderboard rows already follow canonical rank; reverse the input to
      // expose an omitted rank tie-break even when the original order masks it.
      checkSort(subset.toReversed(), field, page.rankingKey, direction, page.slug + "/" + id + " reversed input");
      orders++;
      placements += subset.length;
    }
  }
}

// Published ranks are unique. Deliberately duplicate one to exercise the stable
// fallback both ways, with input names in reverse alphabetical order.
const ties = ["Zulu", "Alpha", "Bravo"].map(name => ({ name, rating: "50%", ranking: 1 }));
for (const direction of directions) {
  for (const field of ["rating", "ranking"]) checkSort(ties, field, "ranking", direction, "full tie");
}
console.log(`Verified ${orders} sort orders and ${placements} row placements for ${roster.length} players across ${POSITION_PAGES.length} position tables, including filtered views and both directions.`);
