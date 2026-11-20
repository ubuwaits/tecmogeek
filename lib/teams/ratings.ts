import type { SortDirection, TeamRatingRecord, TeamSlug } from "@/lib/types";

export type TeamRatingSortKey =
  | "overall_rating"
  | "offensive_rating"
  | "defensive_rating"
  | "running_offense"
  | "passing_offense"
  | "balanced_offense"
  | "dl_group"
  | "lb_group"
  | "secondary_group";

export type TeamRatingSummaryItem = {
  key: TeamRatingSortKey;
  label: string;
  rank: number;
  rating: number;
};

export const TEAM_PAGE_RATING_ITEMS = [
  { key: "overall_rating", label: "Overall" },
  { key: "offensive_rating", label: "Offense" },
  { key: "defensive_rating", label: "Defense" },
] as const satisfies readonly Pick<TeamRatingSummaryItem, "key" | "label">[];

export function formatTeamRating(value: number) {
  return `${value.toFixed(1)}%`;
}

export function getTeamRatingSortValue(team: TeamRatingRecord, sortKey: TeamRatingSortKey) {
  switch (sortKey) {
    case "overall_rating":
    case "offensive_rating":
    case "defensive_rating":
      return team[sortKey];
    case "running_offense":
    case "passing_offense":
    case "balanced_offense":
    case "dl_group":
    case "lb_group":
    case "secondary_group":
      return team.components[sortKey];
  }
}

export function sortTeamRatingsByKey(
  teams: readonly TeamRatingRecord[],
  sortKey: TeamRatingSortKey,
  sortDirection: SortDirection,
) {
  return [...teams].sort((left, right) => {
    const ratingDifference =
      sortDirection === "desc"
        ? getTeamRatingSortValue(right, sortKey) - getTeamRatingSortValue(left, sortKey)
        : getTeamRatingSortValue(left, sortKey) - getTeamRatingSortValue(right, sortKey);

    if (ratingDifference !== 0) {
      return ratingDifference;
    }

    return left.full_name.localeCompare(right.full_name);
  });
}

export function getRankedTeamRows(
  teams: readonly TeamRatingRecord[],
  sortKey: TeamRatingSortKey,
  direction: SortDirection,
) {
  const standings = sortTeamRatingsByKey(teams, sortKey, "desc")
    .map((team, index) => ({ team, rank: index + 1 }));
  if (direction === "desc") return standings;

  const rowsByTeam = new Map(standings.map(row => [row.team.team, row]));
  return sortTeamRatingsByKey(teams, sortKey, "asc").map(team => rowsByTeam.get(team.team)!);
}

export function getTeamRatingSummaries(
  teams: readonly TeamRatingRecord[],
  teamSlug: TeamSlug,
): TeamRatingSummaryItem[] {
  return TEAM_PAGE_RATING_ITEMS.flatMap(({ key, label }) => {
    const row = getRankedTeamRows(teams, key, "desc").find(({ team }) => team.team === teamSlug);
    if (!row) return [];

    return [{ key, label, rank: row.rank, rating: getTeamRatingSortValue(row.team, key) }];
  });
}
