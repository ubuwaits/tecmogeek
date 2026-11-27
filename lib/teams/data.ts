import "server-only";

import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";

import { withReturnSpeeds } from "@/lib/players/return-speeds.mts";
import { buildTeamRatingRecord } from "./calculate-ratings.mts";
import { parseTeamRoster } from "./parse-roster.mts";
import { TEAM_SLUGS, type TeamSlug } from "@/lib/teams/slugs.mts";

const DATA_DIR = path.join(process.cwd(), "data");

export const getTeam = cache(async (slug: TeamSlug) => {
  const contents = await fs.readFile(path.join(DATA_DIR, slug + ".json"), "utf8");
  return withReturnSpeeds(parseTeamRoster(slug, contents));
});

export const getTeamRosters = cache(async () =>
  Promise.all(TEAM_SLUGS.map(async slug => ({ slug, ...await getTeam(slug) }))),
);

export const getTeamRatings = cache(async () =>
  (await getTeamRosters()).map(team => buildTeamRatingRecord(team.slug, team)),
);
