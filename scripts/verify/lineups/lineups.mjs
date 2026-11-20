import assert from "node:assert/strict";
import { read } from "../roster-data.mjs";
import { createOffensiveSkillLineups, getTeamFileNames } from "../../rebuild/team-ratings.ts";
import { exactLineupPoints, modes, readSkillPlayers, slots, verifyLineup } from "./model.mjs";

function rosterIndices(players, assignment) {
  return slots.map(slot => {
    const { rosterIndex, name, position } = assignment[slot];
    assert(players[rosterIndex]?.name === name && players[rosterIndex]?.position === position,
      `Unknown player in ${slot}: ${name} (${position})`);
    return rosterIndex;
  });
}

async function verify(players, mode, assignment, reportedScore) {
  const selected = rosterIndices(players, assignment);
  const score = await verifyLineup(players, mode, selected);
  assert(Math.abs(score - reportedScore) <= 1e-9,
    `Selected lineup scores ${score}, generator reported ${reportedScore}`);
}

function prefixCheck(players, mode, file) {
  const seen = new Set();
  const candidates = [];
  function observe(candidate, incumbent, bestScore) {
    const ids = rosterIndices(players, candidate);
    assert.equal(new Set(ids).size, slots.length);
    const subset = ids.toSorted((a, b) => a - b).join(",");
    assert(!seen.has(subset), file + ": repeated candidate " + subset);
    seen.add(subset);

    const points = exactLineupPoints(players, mode, ids);
    const signature = slots.map((slot, i) => slot + ":" + players[ids[i]].name).join("|");
    candidates.push({ candidate, points, signature });
    // Independently select the greatest integer score and earliest signature over the full prefix.
    const maximum = Math.max(...candidates.map(c => c.points));
    const winner = candidates.filter(c => c.points === maximum).sort((a, b) =>
      a.signature < b.signature ? -1 : a.signature > b.signature ? 1 : 0)[0];
    const label = file + " " + mode + " after candidate " + candidates.length;
    assert.deepEqual(incumbent, winner.candidate, label);
    assert(Math.abs(bestScore - maximum / 8000) <= 1e-9, label);
  }
  return { observe, seen };
}

let prefixes = 0;
let verified = 0;
const files = getTeamFileNames();
assert(files.length > 0, "No team rosters found");
for (const file of files) {
  const roster = read(file).players;
  const players = readSkillPlayers(roster);
  const checks = Object.fromEntries(modes.map(mode => [mode, prefixCheck(players, mode, file)]));
  const result = createOffensiveSkillLineups(roster, Object.fromEntries(modes.map(mode => [mode, checks[mode].observe])));
  for (const mode of modes) {
    try {
      assert.equal(checks[mode].seen.size, 252, "Expected all five-player subsets of ten players");
      prefixes += checks[mode].seen.size;
      await verify(players, mode, result[mode + "Assignment"], result[mode + "SkillRating"]);
      verified++;
    } catch (error) {
      console.error(`${file} ${mode}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
console.log(`Verified ${verified}/${files.length * modes.length} lineups across ${files.length} teams and ${prefixes} candidate prefixes.`);
