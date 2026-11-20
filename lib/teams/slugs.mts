export const TEAM_SLUGS = [
  "49ers",
  "bears",
  "bengals",
  "bills",
  "broncos",
  "browns",
  "buccaneers",
  "cardinals",
  "chargers",
  "chiefs",
  "colts",
  "cowboys",
  "dolphins",
  "eagles",
  "falcons",
  "giants",
  "jets",
  "lions",
  "oilers",
  "packers",
  "patriots",
  "raiders",
  "rams",
  "redskins",
  "saints",
  "seahawks",
  "steelers",
  "vikings",
] as const;

export type TeamSlug = (typeof TEAM_SLUGS)[number];

const validTeamSlugs: ReadonlySet<string> = new Set(TEAM_SLUGS);

export function isTeamSlug(slug: string): slug is TeamSlug {
  return validTeamSlugs.has(slug);
}
