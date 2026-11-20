import { readFileSync } from "node:fs";
import type { TeamData, TeamSlug } from "../../lib/types";

// Compute expected return speeds directly from the raw starters, independent of the site and rebuild.
export function readTestRoster(slug: TeamSlug) {
  const roster: TeamData = JSON.parse(readFileSync(`data/${slug}.json`, "utf8"));
  const kickSpeed = roster.players.find(player => player.position === "RT")!.maximum_speed;
  const puntSpeed = roster.players.find(player => player.position === "SS")!.maximum_speed;
  const players = roster.players.map(player => ({
    ...player,
    teamSlug: slug,
    ...(/^(RB|WR|TE)\d+$/.test(player.position) && {
      kick_return_maximum_speed: kickSpeed,
      punt_return_maximum_speed: puntSpeed,
    }),
  }));
  return { ...roster, slug, players };
}
