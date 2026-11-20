import assert from "node:assert/strict";
import { getTeamFileNames } from "./rebuild-team-ratings.ts";
import { read, skillPositions } from "./player-ranking-data.mjs";
import { attribute, modes, readSkillPlayers, slots, verifyLineup } from "./lineup-verification.mjs";

function label(player) {
  return `${player.name} (${player.position})`;
}

function checkKeys(object, keys, field) {
  assert.deepEqual(Object.keys(object).sort(), [...keys].sort(), `${field}: missing or unexpected fields`);
}

function bestTwo(players, field) {
  // Stable sort preserves source roster order for equal ratings.
  const ranked = players.map(player => ({ label: label(player), score: attribute(player[field]) }))
    .sort((a, b) => b.score - a.score);
  assert(ranked.length >= 2);
  return ranked.slice(0, 2);
}

function unitMean(roster, positions) {
  let sum = 0;
  for (const position of positions) {
    const matches = roster.filter(player => player.position === position);
    assert.equal(matches.length, 1, `Expected exactly one starter at ${position}`);
    sum += attribute(matches[0].rating);
  }
  return sum / positions.length;
}

async function verifyTeam({ components, selected_lineups: selected }, roster) {
  checkKeys(selected, ["best_qb", "backup_qb", "kr", "pr", ...modes.map(mode => mode + "_lineup")], "selected_lineups");
  const quarterbacks = roster.filter(player => /^QB\d+$/.test(player.position));
  assert.equal(quarterbacks.length, 2);
  const [starter, backup] = bestTwo(quarterbacks, "rating");
  const eligible = roster.filter(player => skillPositions.test(player.position));
  const [kr1, kr2] = bestTwo(eligible, "kick_return_rating");
  const [pr1, pr2] = bestTwo(eligible, "punt_return_rating");
  const selections = { best_qb: starter.label, backup_qb: backup.label, kr: kr1.label, pr: pr1.label };
  for (const [field, expected] of Object.entries(selections)) {
    assert.equal(selected[field], expected, `selected_lineups.${field}: expected ${expected}, found ${selected[field]}`);
  }

  const players = readSkillPlayers(roster);
  const byLabel = new Map(players.map((player, index) => [label(player), index]));
  assert.equal(byLabel.size, players.length, "Ambiguous roster labels");
  const skill = {};
  for (const mode of modes) {
    const field = mode + "_lineup";
    const lineup = selected[field];
    checkKeys(lineup, slots, field);
    const ids = slots.map(slot => {
      assert(byLabel.has(lineup[slot]), `${field}.${slot}: unknown eligible player ${lineup[slot]}`);
      return byLabel.get(lineup[slot]);
    });
    try {
      // Certify the published assignment itself; its score comes from roster attributes.
      skill[mode] = await verifyLineup(players, mode, ids);
    } catch (error) {
      throw new Error(`${field}: ${error.message}`);
    }
  }

  const qb = (4 * starter.score + backup.score) / 5;
  const returns = (55 * (3 * kr1.score + kr2.score) + 45 * (3 * pr1.score + pr2.score)) / 400;
  const line = unitMean(roster, ["C", "LG", "RG", "LT", "RT"]);
  const expected = {
    qb_room: qb, qb_rating: starter.score, return_room: returns, ol_line: line,
    running_skill: skill.running, passing_skill: skill.passing, balanced_skill: skill.balanced,
    running_offense: (63 * skill.running + 27 * line + 10 * returns) / 100,
    passing_offense: (450 * qb + 315 * skill.passing + 135 * line + 100 * returns) / 1000,
    balanced_offense: (27 * qb + 18 * line + 45 * skill.balanced + 10 * returns) / 100,
    dl_group: unitMean(roster, ["RE", "NT", "LE"]),
    lb_group: unitMean(roster, ["ROLB", "RILB", "LILB", "LOLB"]),
    secondary_group: unitMean(roster, ["RCB", "LCB", "FS", "SS"]),
  };
  checkKeys(components, Object.keys(expected), "components");
  for (const [field, score] of Object.entries(expected)) {
    const stored = components[field];
    assert(Number.isFinite(stored) && stored === Number(stored.toFixed(3)) &&
      Math.abs(stored - score) <= 0.0005 + 1e-12,
    `components.${field}: expected ${score} rounded to three decimals, found ${stored}`);
  }
  return { components: Object.keys(expected).length, labels: Object.keys(selections).length + modes.length * slots.length };
}

const records = read("team-ratings.json");
const files = getTeamFileNames();
assert(files.length > 0);
assert.deepEqual(records.map(row => row.team).sort(), files.map(file => file.slice(0, -5)).sort());
let components = 0;
let labels = 0;
for (const record of records) {
  try {
    const checked = await verifyTeam(record, read(record.team + ".json").players);
    components += checked.components;
    labels += checked.labels;
  } catch (error) {
    throw new Error(`${record.team}: ${error.message}`);
  }
}
console.log(`Verified ${components} stored components and ${labels} selected-player labels across ${records.length} teams.`);
