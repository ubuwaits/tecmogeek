import { POSITION_PAGES } from "./config";
import { leaguePlayers, positionEntries } from "./leaderboard";
import { getHomeEntries } from "./utils";
import type { TeamData, TeamSlug } from "@/lib/types";

export function homeLeaderboards(rosters: readonly (TeamData & { slug: TeamSlug })[]) {
  const entries = leaguePlayers(rosters);
  const names = new Map(rosters.map(team => [team.slug, team.full_name]));
  return POSITION_PAGES.map(page => ({
    page,
    players: getHomeEntries(page, positionEntries(entries, page)).map(entry => ({
      entry, teamSlug: entry.teamSlug, teamName: names.get(entry.teamSlug)!,
    })),
  }));
}
