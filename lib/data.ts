import "server-only";

import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { resolveTeamSlug } from "@/lib/teams/config";
import { positionEntries } from "@/lib/players/leaderboard";
import { POSITION_SLUGS, TEAM_SLUGS } from "@/lib/types";
import type { PlayerRecord, PositionSlug, TeamData, TeamRatingRecord, TeamSlug } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

export const getTeam = cache(async (slug: TeamSlug) => {
  const team = await readJson<TeamData>(`${slug}.json`);
  return { ...team, short_name: resolveTeamSlug(team.short_name, slug) };
});

export const getTeamRatings = cache(async (): Promise<TeamRatingRecord[]> => {
  return readJson<TeamRatingRecord[]>("team-ratings.json");
});

const getRosterPlayers = cache(async () => {
  const teams = await Promise.all(TEAM_SLUGS.map(getTeam));
  return teams.flatMap(team => team.players);
});

export const getPositionEntries = cache(async (slug: PositionSlug): Promise<PlayerRecord[]> => {
  return positionEntries(await getRosterPlayers(), POSITION_PAGE_CONFIG_MAP[slug]);
});

export const getLeaderboardCounts = cache(async () => {
  const counts = await Promise.all(POSITION_SLUGS.map(async slug =>
    [slug, (await getPositionEntries(slug)).length] as const
  ));
  return Object.fromEntries(counts) as Record<PositionSlug, number>;
});
