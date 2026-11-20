import { readFileSync } from "node:fs";
import { positionEntries } from "../../lib/players/leaderboard";
import { POSITION_PAGE_CONFIG_MAP } from "../../lib/players/config";
import { TEAM_SLUGS, type PositionSlug, type TeamData } from "../../lib/types";

const players = TEAM_SLUGS.flatMap(slug => {
  const team: TeamData = JSON.parse(readFileSync(`data/${slug}.json`, "utf8"));
  return team.players.map(player => ({ ...player, teamSlug: slug }));
});

export function leaderboard(slug: PositionSlug) {
  return positionEntries(players, POSITION_PAGE_CONFIG_MAP[slug]);
}
