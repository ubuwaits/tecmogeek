import "server-only";

import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";

import type { TeamSlug } from "@/lib/teams/slugs.mts";
import type { TeamData, TeamRatingRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

export const getTeam = cache(async (slug: TeamSlug) => {
  return readJson<TeamData>(`${slug}.json`);
});

export const getTeamRatings = cache(async (): Promise<TeamRatingRecord[]> => {
  return readJson<TeamRatingRecord[]>("team-ratings.json");
});
