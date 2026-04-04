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

export function getTeamRatingSummaries(
  teams: readonly TeamRatingRecord[],
  teamSlug: TeamSlug,
): TeamRatingSummaryItem[] {
  const team = teams.find((entry) => entry.team === teamSlug);

  if (!team) {
    return [];
  }

  return TEAM_PAGE_RATING_ITEMS.map(({ key, label }) => ({
    key,
    label,
    rank: sortTeamRatingsByKey(teams, key, "desc").findIndex((entry) => entry.team === teamSlug) + 1,
    rating: getTeamRatingSortValue(team, key),
  }));
}
