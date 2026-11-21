import { TEAM_GROUPS } from "../../data/divisions.ts";

export type TeamSlug = (typeof TEAM_GROUPS)[number]["teams"][number];

export const DIVISION_TEAM_SLUGS: readonly TeamSlug[] = TEAM_GROUPS.flatMap(group => group.teams);
export const TEAM_SLUGS: readonly TeamSlug[] = DIVISION_TEAM_SLUGS.toSorted();

const validTeamSlugs: ReadonlySet<string> = new Set(TEAM_SLUGS);

export function isTeamSlug(slug: string): slug is TeamSlug {
  return validTeamSlugs.has(slug);
}
