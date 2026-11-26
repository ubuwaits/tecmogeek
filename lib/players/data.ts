import "server-only";

import { cache } from "react";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { leaderboardCounts, leaguePlayers, positionEntries } from "@/lib/players/leaderboard";
import { getTeamRosters } from "@/lib/teams/data";
import type { LeaderboardPlayer, PositionSlug } from "@/lib/types";

const getRosterPlayers = cache(async () => leaguePlayers(await getTeamRosters()));

export const getPositionEntries = cache(async (slug: PositionSlug): Promise<LeaderboardPlayer[]> => {
  return positionEntries(await getRosterPlayers(), POSITION_PAGE_CONFIG_MAP[slug]);
});

export const getLeaderboardCounts = cache(async () => leaderboardCounts(await getRosterPlayers()));
