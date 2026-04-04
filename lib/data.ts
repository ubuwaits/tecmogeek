import "server-only";

import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import type { PlayerRecord, PositionSlug, TeamData, TeamRatingRecord, TeamSlug } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

export const getPositionEntries = cache(async (slug: PositionSlug): Promise<PlayerRecord[]> => {
  const config = POSITION_PAGE_CONFIG_MAP[slug];
  return readJson<PlayerRecord[]>(config.dataFile);
});

export const getTeam = cache(async (slug: TeamSlug): Promise<TeamData> => {
  return readJson<TeamData>(`${slug}.json`);
});

export const getTeamRatings = cache(async (): Promise<TeamRatingRecord[]> => {
  return readJson<TeamRatingRecord[]>("team-ratings.json");
});
