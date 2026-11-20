import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { applyReturnSpeeds } from "../../../lib/players/return-speeds.mts";
import { positions, skillPositions } from "../roster-data.mjs";

// Independently score with integer arithmetic, then resolve full ties by the prior category rank.
function rateGroup(players, weights, hpWeight, ladder, ratingKey, rankingKey) {
  const maxima = Object.fromEntries(Object.keys(weights).map(key => [key, Math.max(...players.map(p => p[key]))]));
  const denominator = Object.values(maxima).reduce((a, b) => a * b, 100);
  const changedPlayers = new Set();
  let ranks = 0;
  for (const player of players) {
    let numerator = (ladder[player.hitting_power] ?? 0) * hpWeight * (denominator / 100);
    for (const [key, weight] of Object.entries(weights)) numerator += weight * player[key] * (denominator / maxima[key]);
    assert(Number.isSafeInteger(2 * numerator + denominator));
    const rating = Math.floor((2 * numerator + denominator) / (2 * denominator)) + "%";
    if (player[ratingKey] !== rating) {
      changedPlayers.add(player);
    }
    player[ratingKey] = rating;
  }
  players.sort((a, b) => parseInt(b[ratingKey]) - parseInt(a[ratingKey]) ||
    b.hitting_power - a.hitting_power || a[rankingKey] - b[rankingKey]);
  players.forEach((player, i) => {
    if (player[rankingKey] !== i + 1) ranks++;
    player[rankingKey] = i + 1;
  });
  return { ratings: changedPlayers.size, ranks, changedPlayers };
}

function defensiveEdit(rosters, edited, attribute) {
  const players = rosters.flatMap(team => team.players);
  const group = players.filter(p => positions.dl.test(p.position));
  const changes = rateGroup(group, { running_speed: 10, rushing_power: 35, maximum_speed: 10, pass_interceptions: 5 },
    40, { 19: 0, 25: 7, 31: 16, 38: 23, 44: 30, 50: 36, 56: 45, 63: 59, 69: 78, 75: 100 }, "rating", "ranking");
  assert(changes.ranks > 0);
  if (attribute === "maximum_speed") {
    assert(group.every(p => p === edited || p.maximum_speed < edited.maximum_speed));
    assert(rosters.filter(team => team.players.some(p => changes.changedPlayers.has(p))).length > 1);
  } else {
    assert.equal(changes.ratings, 1);
  }
}

function rightTackleEdit(rosters) {
  const players = rosters.flatMap(team => team.players);
  const skill = players.filter(p => skillPositions.test(p.position));
  for (const team of rosters) {
    const kickSpeed = team.players.find(p => p.position === "RT").maximum_speed;
    for (const player of team.players.filter(p => skillPositions.test(p.position))) player.kick_return_maximum_speed = kickSpeed;
  }
  const returns = rateGroup(skill, { running_speed: 20, kick_return_maximum_speed: 60, ball_control: 10 },
    10, { 75: 5, 81: 25, 88: 60, 94: 100 }, "kick_return_rating", "kick_return_ranking");
  assert(returns.ratings > 0 && returns.ranks > 0);
  for (const player of skill) delete player.kick_return_maximum_speed;
  rateGroup(players.filter(p => positions.ol.test(p.position)), { maximum_speed: 20 },
    80, { 31: 0, 38: 15, 44: 30, 50: 45, 56: 55, 63: 65, 69: 80, 75: 90, 81: 100 }, "rating", "ranking");
}

export function verifyRosterEdits(checkout, baseline, runRebuilds, listFiles) {
  const directory = path.join(checkout, "data");
  const file = name => path.join(directory, name);
  const scenarios = [
    { position: "LE", attribute: "hitting_power", value: 50, predict: defensiveEdit },
    { position: "LE", attribute: "maximum_speed", value: 81, predict: defensiveEdit },
    { position: "RT", attribute: "maximum_speed", value: 50, predict: rightTackleEdit },
  ];
  for (const { position, attribute, value, predict } of scenarios) {
    for (const [name, bytes] of baseline) writeFileSync(file(name), bytes);
    const records = JSON.parse(baseline.get("team-ratings.json"));
    const rosters = new Map(records.map(({ team }) => [team, JSON.parse(baseline.get(team + ".json"))]));
    const eagles = rosters.get("eagles");
    const edited = eagles.players.find(p => p.position === position);
    assert.notEqual(edited[attribute], value);
    edited[attribute] = value;
    writeFileSync(file("eagles.json"), JSON.stringify(eagles));
    predict([...rosters.values()], edited, attribute);
    runRebuilds();

    assert.deepEqual(new Set(listFiles(directory)), new Set(baseline.keys()));
    const actualRecords = JSON.parse(readFileSync(file("team-ratings.json")));
    assert.deepEqual(actualRecords.map(r => r.team), records.map(r => r.team));
    for (const [i, record] of records.entries()) {
      const team = rosters.get(record.team);
      const rebuilt = JSON.parse(readFileSync(file(record.team + ".json")));
      assert.deepEqual(rebuilt, team, record.team);
      if (position === "RT") {
        const kickSpeed = team.players.find(player => player.position === "RT").maximum_speed;
        const puntSpeed = team.players.find(player => player.position === "SS").maximum_speed;
        applyReturnSpeeds(rebuilt);
        for (const player of rebuilt.players.filter(p => skillPositions.test(p.position))) {
          assert.equal(player.kick_return_maximum_speed, kickSpeed);
          assert.equal(player.punt_return_maximum_speed, puntSpeed);
        }
      }
      const kickReturner = team.players.filter(p => skillPositions.test(p.position))
        .sort((a, b) => parseInt(b.kick_return_rating) - parseInt(a.kick_return_rating))[0];
      record.selected_lineups.kr = `${kickReturner.name} (${kickReturner.position})`;
      const actual = actualRecords[i];
      // The rounding verifier below checks every numeric field against the edited rosters.
      const changed = position === "RT"
        ? ["ol_line", "return_room", "running_offense", "passing_offense", "balanced_offense", "offensive_rating", "overall_rating"]
        : ["dl_group", "defensive_rating", "overall_rating"];
      for (const field of changed) {
        if (field in record.components) record.components[field] = actual.components[field];
        else record[field] = actual[field];
      }
      assert.deepEqual(actual, record, record.team);
    }
    const rebuiltFiles = new Set(["team-ratings.json", ...records.map(record => record.team + ".json")]);
    for (const [name, bytes] of baseline) {
      if (!rebuiltFiles.has(name)) {
        assert(readFileSync(file(name)).equals(bytes), name);
      }
    }
    execFileSync(process.execPath, ["scripts/verify/teams/rounding.mjs"], { cwd: checkout, stdio: ["ignore", "ignore", "inherit"] });
    console.log(`Verified Eagles ${position} ${attribute} edit across all ${records.length} teams.`);
  }
}
