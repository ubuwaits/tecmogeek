import assert from "node:assert/strict";
import { init } from "z3-solver";
import { sortEntriesByKey } from "../../../lib/player-sort.ts";
import { POSITION_PAGES } from "../../../lib/players/config.ts";
import { indexPlayers, key, positions, read } from "../roster-data.mjs";
import { getTeamFileNames } from "../../rebuild/team-ratings.ts";

const { Context } = await init();
const { Int, Or, And, Solver, Not, simplify, substitute } = new Context("player_sorting");

// Model the signs of (left - right) for the selected value, canonical rank,
// and input position. Only these three comparisons can affect the ordering.
function precedes(value, rank, position, direction) {
  const asc = direction === "asc";
  return Or(asc ? value.lt(0) : value.gt(0), And(value.eq(0),
    Or(asc ? rank.gt(0) : rank.lt(0), And(rank.eq(0), position.lt(0)))));
}

async function orderingRule(direction) {
  const delta = ["value", "rank", "position"].map(name => Int.const(name));
  const next = ["nextValue", "nextRank", "nextPosition"].map(name => Int.const(name));
  const before = precedes(...delta, direction);
  const after = precedes(...delta.map(x => x.neg()), direction);
  const solver = new Solver();
  try {
    // For any two distinct rows exactly one precedes the other. For three rows,
    // (a - c) = (a - b) + (b - c) in each coordinate.
    solver.add(Or(And(before, after), And(delta[2].neq(0), Not(Or(before, after))),
      And(before, precedes(...next, direction), Not(precedes(...delta.map((x, i) => x.add(next[i])), direction)))));
    const result = await solver.check();
    assert.equal(result, "unsat", result === "sat" ? solver.model().toString() : "Could not prove sort order");
  } finally {
    solver.release();
  }

  // Evaluate the model once per possible comparison; reuse it for every row.
  const allowed = new Set();
  for (const v of [-1, 0, 1]) for (const r of [-1, 0, 1]) for (const p of [-1, 0, 1]) {
    const signs = [v, r, p];
    const expression = substitute(before, ...delta.map((x, i) => [x, Int.val(signs[i])]));
    if ((await simplify(expression)).toString() === "true") allowed.add(signs.join(","));
  }
  return allowed;
}

function numeric(player, field) {
  const raw = player[field];
  assert(typeof raw === "number" || /^\d+(\.\d+)?%?$/.test(raw), `${key(player)}: invalid ${field}`);
  const value = Number(String(raw).replace(/%$/, ""));
  assert(Number.isFinite(value), `${key(player)}: nonfinite ${field}`);
  return value;
}

function checkSort(rows, field, rankField, direction, allowed, description) {
  const index = new Map(rows.map((row, i) => [row, i]));
  const sorted = sortEntriesByKey(Object.freeze([...rows]), field, direction, rankField);
  assert.deepEqual(new Set(sorted), new Set(rows), description + ": changed membership");
  assert.equal(sorted.length, rows.length, description + ": changed length");
  for (let i = 1; i < sorted.length; i++) {
    const left = sorted[i - 1];
    const right = sorted[i];
    const signs = [numeric(left, field) - numeric(right, field),
      numeric(left, rankField) - numeric(right, rankField), index.get(left) - index.get(right)].map(Math.sign);
    assert(allowed.has(signs.join(",")), `${description} ${field} ${direction}: ${key(left)} precedes ${key(right)} at row ${i}`);
  }
}

const rules = { asc: await orderingRule("asc"), desc: await orderingRule("desc") };
const roster = getTeamFileNames().flatMap(file => read(file).players);
const rosterIds = new Set(indexPlayers(roster, "team rosters").keys());
const covered = new Set();
let orders = 0;
let placements = 0;
for (const page of POSITION_PAGES) {
  const rows = read(page.dataFile);
  const expected = roster.filter(player => positions[page.slug].test(player.position));
  assert(rows.length > 0);
  assert.deepEqual(new Set(indexPlayers(rows, page.dataFile).keys()), new Set(expected.map(key)), page.slug);
  for (const row of rows) covered.add(key(row));
  const fields = [page.rankingKey, page.ratingKey, ...page.columns.map(column => column.key)];
  const filters = page.filters ?? [{ id: "all", allowedPrefixes: [] }];
  for (const { id, allowedPrefixes } of filters) {
    const subset = rows.filter(row => !allowedPrefixes.length || allowedPrefixes.some(prefix => row.position.startsWith(prefix)));
    assert(subset.length > 0);
    for (const field of fields) for (const [direction, allowed] of Object.entries(rules)) {
      checkSort(subset, field, page.rankingKey, direction, allowed, page.slug + "/" + id);
      // Aggregate files already follow canonical rank; reverse the input to
      // expose an omitted rank tie-break even when the original order masks it.
      checkSort(subset.toReversed(), field, page.rankingKey, direction, allowed, page.slug + "/" + id + " reversed input");
      orders++;
      placements += subset.length;
    }
  }
}

// Published ranks are unique. Deliberately duplicate one to exercise the stable
// fallback both ways, with input names in reverse alphabetical order.
const ties = ["Zulu", "Alpha", "Bravo"].map(name => ({ name, rating: "50%", ranking: 1 }));
for (const [direction, allowed] of Object.entries(rules)) {
  for (const field of ["rating", "ranking"]) checkSort(ties, field, "ranking", direction, allowed, "full tie");
}
assert.deepEqual(covered, rosterIds);
console.log(`Verified ${orders} sort orders and ${placements} row placements for ${covered.size} players across ${POSITION_PAGES.length} position tables, including filtered views and both directions.`);
