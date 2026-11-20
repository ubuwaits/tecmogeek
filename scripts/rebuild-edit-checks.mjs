import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFENSIVE_HP_SCORE_MAP } from "./rebuild-defensive-ratings.mjs";

const attributes = { running_speed: 10, rushing_power: 35, maximum_speed: 10, pass_interceptions: 5 };
function expectedLine(rows) {
  const maxima = Object.fromEntries(Object.keys(attributes).map(key => [key, Math.max(...rows.map(p => p[key]))]));
  const denominator = Object.values(maxima).reduce((a, b) => a * b, 100);
  for (const p of rows) {
    let numerator = (DEFENSIVE_HP_SCORE_MAP[p.hitting_power] ?? 0) * 40 * (denominator / 100);
    for (const [key, weight] of Object.entries(attributes)) numerator += weight * p[key] * (denominator / maxima[key]);
    assert(Number.isSafeInteger(2 * numerator + denominator));
    p.rating = Math.floor((2 * numerator + denominator) / (2 * denominator)) + "%";
  }
  // Original input order supplies the last tie-break via stable sort.
  rows.sort((a, b) => parseInt(b.rating) - parseInt(a.rating) || b.hitting_power - a.hitting_power);
  rows.forEach((p, i) => { p.ranking = i + 1; });
  return rows;
}

export function verifyRosterEdits(checkout, baseline, runRebuilds, listFiles) {
  const directory = path.join(checkout, "data");
  const file = name => path.join(directory, name);
  const source = name => JSON.parse(baseline.get(name));
  const read = name => JSON.parse(readFileSync(file(name)));
  for (const [attribute, value] of [["hitting_power", 50], ["maximum_speed", 81]]) {
    for (const [name, bytes] of baseline) writeFileSync(file(name), bytes);
    const roster = source("eagles.json"), line = source("dl.json");
    for (const [name, content, players] of [["dl.json", line, line], ["eagles.json", roster, roster.players]]) {
      const matches = players.filter(p => p.team === "Eagles" && p.position === "LE");
      assert.equal(matches.length, 1);
      assert.notEqual(matches[0][attribute], value);
      matches[0][attribute] = value;
      writeFileSync(file(name), JSON.stringify(content));
    }
    runRebuilds();
    const expected = expectedLine(line);
    assert.deepEqual(read("dl.json"), expected);
    const bySlot = new Map(expected.map(p => [p.team.toLowerCase() + "/" + p.position, p]));
    const updatedTeams = new Set();
    let ratings = 0, ranks = 0;
    const teamRecords = source("team-ratings.json");
    const actualRecords = read("team-ratings.json");
    assert.deepEqual(actualRecords.map(r => r.team), teamRecords.map(r => r.team));
    const allowed = new Set(["dl.json", "team-ratings.json"]);
    for (const [i, record] of teamRecords.entries()) {
      const name = record.team + ".json";
      const original = source(name);
      let sumChange = 0;
      for (const player of original.players) {
        const next = bySlot.get(record.team + "/" + player.position);
        if (!next) continue;
        sumChange += parseInt(next.rating) - parseInt(player.rating);
        if (next.rating !== player.rating) {
          ratings++;
          updatedTeams.add(record.team);
        }
        if (next.ranking !== player.ranking) ranks++;
        Object.assign(player, { rating: next.rating, ranking: next.ranking });
        if (record.team === "eagles" && player.position === "LE") player[attribute] = value;
      }
      assert.deepEqual(read(name), original, name);
      allowed.add(name);
      // Only these three team fields depend on defensive line ratings. The exact
      // rounding verifier below independently checks their values in the edited checkout.
      const actual = actualRecords[i];
      if (sumChange !== 0) {
        for (const field of ["defensive_rating", "overall_rating"]) {
          assert.notEqual(record[field], actual[field]);
          record[field] = actual[field];
        }
        assert.notEqual(record.components.dl_group, actual.components.dl_group);
        record.components.dl_group = actual.components.dl_group;
      }
      assert.deepEqual(actual, record, record.team);
    }
    assert.deepEqual(new Set(listFiles(directory)), new Set(baseline.keys()));
    for (const [name, bytes] of baseline) {
      if (!allowed.has(name)) assert(readFileSync(file(name)).equals(bytes), name);
    }
    assert(ranks > 0);
    if (attribute === "maximum_speed") {
      assert(value > Math.max(...source("dl.json").map(p => p.maximum_speed)));
      assert(updatedTeams.size > 1);
    } else {
      assert.equal(ratings, 1);
    }
    execFileSync(process.execPath, ["scripts/verify-team-rounding.mjs"], { cwd: checkout, stdio: ["ignore", "ignore", "inherit"] });
    console.log(`${attribute} edit: verified ${ratings} rating changes across ${updatedTeams.size} teams, ${ranks} rank changes, and all data copies.`);
  }
}
