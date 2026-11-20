import { TEAM_SLUGS } from "../../lib/teams/slugs.mts";
import { buildTeamRatingRecord } from "../../lib/teams/calculate-ratings.mts";
import { applyReturnSpeeds } from "../../lib/players/return-speeds.mts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export const skillPositions = /^(RB|WR|TE)\d+$/;
export const positions = {
  qb: /^QB\d+$/, rushers: skillPositions, receivers: skillPositions,
  "kick-returners": skillPositions, "punt-returners": skillPositions,
  ol: /^(C|LG|RG|LT|RT)$/, dl: /^(RE|NT|LE)$/, lb: /^(ROLB|RILB|LILB|LOLB)$/,
  "cb-s": /^(RCB|LCB|FS|SS)$/, k: /^K$/, p: /^P$/,
};

export function read(file) {
  return JSON.parse(readFileSync(new URL("../../data/" + file, import.meta.url), "utf8"));
}

export function getTeamFileNames() {
  return TEAM_SLUGS.map(slug => slug + ".json");
}

export function teamRatingRecords() {
  return TEAM_SLUGS.map(slug => buildTeamRatingRecord(slug, read(slug + ".json")));
}

export function readRosterPlayers(file) {
  const teamSlug = file.replace(/\.json$/, "");
  const roster = read(file);
  applyReturnSpeeds(roster);
  return roster.players.map(player => ({ ...player, teamSlug }));
}

export function key(player) {
  return [player.teamSlug, player.position, player.name].join("|");
}

export function indexPlayers(players, source) {
  const indexed = new Map(players.map(player => [key(player), player]));
  assert.equal(indexed.size, players.length, `Duplicate player in ${source}`);
  return indexed;
}
