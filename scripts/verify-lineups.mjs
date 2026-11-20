import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createOffensiveSkillLineups, getTeamFileNames } from "./rebuild-team-ratings.ts";
import { modes, readSkillPlayers, slots, verifyLineup } from "./lineup-verification.mjs";

async function verify(players, mode, assignment, reportedScore) {
  const selected = slots.map(slot => {
    const { rosterIndex, name, position } = assignment[slot];
    assert(players[rosterIndex]?.name === name && players[rosterIndex]?.position === position,
      `Unknown player in ${slot}: ${name} (${position})`);
    return rosterIndex;
  });
  const score = await verifyLineup(players, mode, selected);
  assert(Math.abs(score - reportedScore) <= 1e-9,
    `Selected lineup scores ${score}, generator reported ${reportedScore}`);
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
