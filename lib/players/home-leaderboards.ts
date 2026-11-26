import { POSITION_PAGES } from "./config";
import { positionEntries } from "./leaderboard";
import { getHomeEntries } from "./utils";
import type { TeamData, TeamSlug } from "@/lib/types";

export function homeLeaderboards(rosters: readonly (TeamData & { slug: TeamSlug })[]) {
  const entries = rosters.flatMap(team => team.players.map(player => ({
    ...player, teamSlug: team.slug, teamName: team.full_name,
  })));
  return POSITION_PAGES.map(page => ({
    page,
    players: getHomeEntries(page, positionEntries(entries, page)),
  }));
}
