import assert from "node:assert/strict";
import { init } from "z3-solver";
import { POSITION_PAGES } from "../lib/players/config.ts";
import { getTeamFileNames } from "./rebuild-team-ratings.ts";
import { indexPlayers, key, positions, read } from "./player-ranking-data.mjs";
import { comparePlayerRanks } from "./compare-player-ranks.mjs";

const { Context } = await init();
const { Int, Or, And, Not, Solver } = new Context("player_rankings");

// Higher primary and secondary values precede lower ones. For complete ties,
// only the order in this category's source file is available.
function precedes(a, b) {
  return Or(a.primary.gt(b.primary), And(a.primary.eq(b.primary),
    Or(a.secondary.gt(b.secondary), And(a.secondary.eq(b.secondary), a.index.lt(b.index)))));
}

async function rejectCounterexample(violation, description) {
  const solver = new Solver();
  try {
    solver.add(violation);
    const result = await solver.check();
    if (result === "sat") throw new Error(`${description}: ${solver.model()}`);
    if (result !== "unsat") throw new Error(`${description}: ${solver.reasonUnknown()}`);
  } finally {
    solver.release();
  }
}

function symbolicPlayer(name) {
  return { primary: Int.const(name + "_primary"), secondary: Int.const(name + "_secondary"), index: Int.const(name + "_index") };
}
const [a, b, c] = ["a", "b", "c"].map(symbolicPlayer);
const ab = precedes(a, b);
const ba = precedes(b, a);
await rejectCounterexample(Or(precedes(a, a), And(ab, ba),
  And(a.index.neq(b.index), Not(Or(ab, ba))),
  And(ab, precedes(b, c), Not(precedes(a, c)))), "Ranking is not a strict total order");

// Exercise all relative orderings of the three keys through the rebuild comparator,
// including a rating and hitting-power tie in either source order.
for (const rating of [-1, 0, 1]) {
  for (const hp of [-1, 0, 1]) {
    for (const index of [-1, 0, 1]) {
      const left = { rating, hittingPower: hp, sourceIndex: index };
      const right = { rating: 0, hittingPower: 0, sourceIndex: 0 };
      const observed = comparePlayerRanks(left, right);
      await rejectCounterexample(And(
        a.primary.sub(b.primary).eq(rating), a.secondary.sub(b.secondary).eq(hp), a.index.sub(b.index).eq(index),
        observed < 0 ? Not(ab) : observed > 0 ? Not(ba) : Or(ab, ba),
      ), "Rebuild comparator disagrees with ranking rule");
    }
  }
}

const teamFiles = getTeamFileNames();
const roster = teamFiles.flatMap(file => read(file).players);
const rosterIndex = indexPlayers(roster, "team rosters");
const ranks = new Map(roster.map(player => [key(player), new Map()]));
const pages = [];
let count = 0;
for (const page of POSITION_PAGES) {
  const rows = read(page.dataFile);
  const eligible = roster.filter(player => positions[page.slug].test(player.position));
  assert(rows.length > 0, `Empty group: ${page.slug}`);
  assert.deepEqual(new Set(indexPlayers(rows, page.dataFile).keys()), new Set(eligible.map(key)), page.dataFile);
  pages.push([page.dataFile, rows]);
  const violations = [];
  let previous;
  const witness = Int.const("row_with_inversion");
  for (const [i, player] of rows.entries()) {
    const id = key(player);
    const source = rosterIndex.get(id);
    const rating = source[page.ratingKey];
    assert(/^(100|[1-9]?\d)%$/.test(rating), `${id}: invalid ${page.ratingKey}`);
    assert.equal(player[page.ratingKey], rating, `${page.slug}: rating mismatch for ${id}`);
    let primary = Number.parseInt(rating, 10);
    let secondary = 0;
    if (page.slug === "k" || page.slug === "p") {
      primary = source.kicking_ability;
      assert.equal(player.kicking_ability, primary, id);
    } else if (page.slug !== "qb") {
      secondary = source.hitting_power;
      assert.equal(player.hitting_power, secondary, id);
    }
    assert(Number.isInteger(primary) && Number.isInteger(secondary), `${id}: invalid ranking input`);
    const current = { primary: Int.val(primary), secondary: Int.val(secondary), index: Int.val(i) };
    if (previous) violations.push(And(witness.eq(i + 1), Not(precedes(previous, current))));
    previous = current;
    ranks.get(id).set(page.rankingKey, i + 1);
  }
  // Transitivity makes adjacent comparisons sufficient for the entire file.
  if (violations.length) await rejectCounterexample(Or(...violations), `Out-of-order players in ${page.dataFile}`);
  count += rows.length;
}

for (const [file, rows] of [["team rosters", roster], ...pages]) {
  for (const player of rows) {
    const expected = ranks.get(key(player));
    assert(expected.size > 0, `Unclassified player: ${key(player)}`);
    for (const [field, rank] of expected) {
      assert.equal(player[field], rank, `${file}: ${key(player)} ${field} should be ${rank}, found ${player[field]}`);
    }
  }
}
console.log(`Verified ${count} rankings for ${roster.length} players across ${teamFiles.length} teams and ${pages.length} position files.`);
