import "server-only";

import { cache } from "react";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { leaderboardCounts, positionEntries } from "@/lib/players/leaderboard";
import { getTeam } from "@/lib/teams/data";
import { TEAM_SLUGS, type LeaderboardPlayer, type PositionSlug } from "@/lib/types";

const getRosterPlayers = cache(async () => {
  const teams = await Promise.all(TEAM_SLUGS.map(getTeam));
  return teams.flatMap((team, index) => team.players.map(player => ({ ...player, teamSlug: TEAM_SLUGS[index] })));
});

export const getPositionEntries = cache(async (slug: PositionSlug): Promise<LeaderboardPlayer[]> => {
  return positionEntries(await getRosterPlayers(), POSITION_PAGE_CONFIG_MAP[slug]);
});

export const getLeaderboardCounts = cache(async () => leaderboardCounts(await getRosterPlayers()));
