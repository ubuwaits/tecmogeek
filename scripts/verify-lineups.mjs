import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { init } from "z3-solver";
import { createOffensiveSkillLineups, getTeamFileNames } from "./rebuild-team-ratings.ts";

const slots = ["RB1", "RB2", "WR1", "WR2", "TE1"];
const modes = ["running", "passing", "balanced"];
const { Context } = await init();
const { Solver, Int, Or, And, Distinct, Sum } = new Context("lineups");

function attribute(value) {
  assert(/^\d+%?$/.test(String(value)), `Expected a whole-number attribute, received ${value}`);
  const number = Number.parseInt(value, 10);
  assert(number <= 100, `Attribute exceeds 100: ${value}`);
  return number;
}

function readSkillPlayers(roster) {
  const players = roster.filter(({ position }) => /^(RB|WR|TE)/.test(position));
  assert.equal(players.length, 10, "Expected ten eligible players");
  return players.map(({ name, position, rushing_rating, receiving_rating, hitting_power }) => {
    assert(typeof name === "string" && !name.includes("|"), "Invalid lineup signature name");
    return { name, position, rush: attribute(rushing_rating), receive: attribute(receiving_rating), hp: attribute(hitting_power) };
  });
}

// Scores are integer multiples of 1/8000 for the whole-percent roster inputs.
// Support is in twentieths, slot weights in hundredths, and balance in quarters.
function contribution(mode, slot, player) {
  const support = player.hp >= 75 ? 1900 + player.receive : 20 * player.receive;
  const rush = [40, 30, 12, 10, 8][slot] * (slot === 4 ? support : 20 * player.rush);
  const pass = [10, 15, 30, 25, 20][slot] * 20 * player.receive;
  if (mode === "running") return 4 * rush;
  if (mode === "passing") return 4 * pass;
  return rush + 3 * pass;
}

function ranks(players, compare) {
  const order = players.map((_, index) => index).sort((a, b) => compare(players[a], players[b]) || a - b);
  return players.map((_, index) => order.indexOf(index));
}

async function verify(players, mode, assignment, reportedScore) {
  const selected = slots.map(slot => {
    const { rosterIndex, name, position } = assignment[slot];
    assert(players[rosterIndex]?.name === name && players[rosterIndex]?.position === position,
      `Unknown player in ${slot}: ${name} (${position})`);
    return rosterIndex;
  });
  const score = selected.reduce((sum, id, slot) => sum + contribution(mode, slot, players[id]), 0);
  assert(Math.abs(score / 8000 - reportedScore) <= 1e-9,
    `Selected lineup scores ${score / 8000}, generator reported ${reportedScore}`);

  const rushRank = ranks(players, (a, b) => b.rush - a.rush);
  const receivingRank = ranks(players, (a, b) => b.receive - a.receive);
  // Within each HP tier the support formula increases strictly with receiving rating.
  const supportRank = ranks(players, (a, b) =>
    Number(b.hp >= 75) - Number(a.hp >= 75) || b.receive - a.receive || b.hp - a.hp);
  const solver = new Solver();
  try {
    const ids = slots.map(slot => Int.const(slot));
    const points = slots.map(slot => Int.const(slot + "_points"));
    const rush = slots.map(slot => Int.const(slot + "_rush_rank"));
    const priority = slots.map(slot => Int.const(slot + "_priority_rank"));
    const priorityRanks = mode === "running" ? supportRank : receivingRank;
    for (const [s, id] of ids.entries()) {
      solver.add(Or(...players.map((player, i) => And(
        id.eq(i), points[s].eq(contribution(mode, s, player)),
        rush[s].eq(rushRank[i]), priority[s].eq(priorityRanks[i]),
      ))));
    }
    solver.add(Distinct(...ids), rush[0].lt(rush[1]));
    if (mode === "running") {
      solver.add(rush[1].lt(rush[2]), rush[2].lt(rush[3]));
      for (const other of priority.slice(0, 4)) solver.add(priority[4].lt(other));
    } else {
      solver.add(priority[2].lt(priority[3]), priority[3].lt(priority[4]),
        priority[4].lt(priority[0]), priority[4].lt(priority[1]));
    }

    const legal = await solver.check(...ids.map((id, slot) => id.eq(selected[slot])));
    assert.equal(legal, "sat", `Selected lineup failed legality check (${legal}): ${selected.map(i => players[i].name)}`);

    // The production signature compares slot names in order, including the separator.
    const earlier = [];
    const samePrefix = [];
    for (const [s, id] of ids.entries()) {
      const suffix = s === slots.length - 1 ? "" : "|";
      const current = players[selected[s]].name;
      const precedes = [];
      const equals = [];
      for (const [i, { name }] of players.entries()) {
        if (name + suffix < current + suffix) precedes.push(id.eq(i));
        if (name === current) equals.push(id.eq(i));
      }
      if (precedes.length) earlier.push(And(...samePrefix, Or(...precedes)));
      samePrefix.push(Or(...equals));
    }
    const total = Sum(...points);
    solver.add(Or(total.gt(score), ...earlier.map(condition => And(total.eq(score), condition))));
    const result = await solver.check();
    if (result === "unknown") throw new Error(`Inconclusive: ${solver.reasonUnknown()}`);
    if (result === "sat") {
      const model = solver.model();
      const witness = ids.map((id, s) => slots[s] + "=" + players[Number(model.eval(id).toString())].name);
      throw new Error(`Selected score ${score / 8000}, preferred lineup scores ${Number(model.eval(total).toString()) / 8000}: ${witness.join(", ")}`);
    }
  } finally {
    solver.release();
  }
}

let verified = 0;
const files = getTeamFileNames();
assert(files.length > 0, "No team rosters found");
for (const file of files) {
  const roster = JSON.parse(readFileSync(new URL("../data/" + file, import.meta.url), "utf8")).players;
  const players = readSkillPlayers(roster);
  const result = createOffensiveSkillLineups(roster);
  for (const mode of modes) {
    try {
      await verify(players, mode, result[mode + "Assignment"], result[mode + "SkillRating"]);
      verified++;
    } catch (error) {
      console.error(`${file} ${mode}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
console.log(`Verified ${verified}/${files.length * modes.length} lineups across ${files.length} teams.`);
