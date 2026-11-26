import assert from "node:assert/strict";
import { it } from "vitest";
import { rebuildPlayerRatings } from "../../scripts/rebuild/player-ratings.mjs";
import { readTeamRosters } from "../../scripts/rebuild/roster-files.mts";

const rosters = readTeamRosters();
const speeds = [6, 13, 19, 25, 31, 38, 44, 50, 56, 63, 69, 75, 81, 88, 94, 100];
const edits = [];
const returners = [];

for (const [slug, { players }] of rosters) {
  const originalSpeeds = {};
  for (const position of ["RT", "SS"]) {
    const starters = players.filter(player => player.position === position);
    assert.equal(starters.length, 1, `${slug}: expected one ${position}`);
    const original = starters[0].maximum_speed;
    assert.ok(speeds.includes(original), `${slug}: invalid ${position} speed ${original}`);
    originalSpeeds[position] = original;
    for (const speed of speeds) {
      if (speed !== original) edits.push({ slug, position, speed });
    }
  }
  for (const [index, player] of players.entries()) {
    if (/^(RB|WR|TE)\d+$/.test(player.position)) {
      returners.push({ slug, index, player, originalSpeeds });
    }
  }
}
assert.equal(returners.length, 28 * 10);
assert.equal(edits.length, 840);

it.each(edits)("rebuilds return speeds after setting $slug $position speed to $speed", ({ slug, position, speed }) => {
  const edited = structuredClone(rosters);
  edited.get(slug).players.find(player => player.position === position).maximum_speed = speed;
  const rebuilt = rebuildPlayerRatings(edited, "all");

  const otherReturn = position === "RT" ? "punt_return" : "kick_return";
  for (const entry of returners) {
    const player = rebuilt.get(entry.slug).players[entry.index];
    const label = `${entry.slug} ${entry.player.name}`;
    const sameTeam = entry.slug === slug;
    assert.equal(player.kick_return_maximum_speed, sameTeam && position === "RT" ? speed : entry.originalSpeeds.RT,
      `${label}: kick return speed`);
    assert.equal(player.punt_return_maximum_speed, sameTeam && position === "SS" ? speed : entry.originalSpeeds.SS,
      `${label}: punt return speed`);
    for (const field of [`${otherReturn}_rating`, `${otherReturn}_ranking`]) {
      assert.equal(player[field], entry.player[field], `${label}: ${field}`);
    }
  }
});
