import { describe, expect, it } from "vitest";

import {
  formatTeamRating,
  getTeamRatingSortValue,
  getTeamRatingSummaries,
  sortTeamRatingsByKey,
} from "@/lib/team-rating-utils";
import type { TeamRatingRecord } from "@/lib/types";

const teams: TeamRatingRecord[] = [
  {
    team: "49ers",
    full_name: "San Francisco 49ers",
    overall_rating: 68.973,
    offensive_rating: 70.673,
    defensive_rating: 67.273,
    components: {
      qb_room: 72.8,
      qb_rating: 77,
      return_room: 77.25,
      ol_line: 66.2,
      running_skill: 70.62,
      passing_skill: 72.05,
      balanced_skill: 68.767,
      running_offense: 70.09,
      passing_offense: 72.118,
      balanced_offense: 70.242,
      dl_group: 66,
      lb_group: 66.5,
      secondary_group: 69,
    },
    selected_lineups: {
      best_qb: "QB1",
      backup_qb: "QB2",
      running_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      passing_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      balanced_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      kr: "KR",
      pr: "PR",
    },
  },
  {
    team: "bills",
    full_name: "Buffalo Bills",
    overall_rating: 64.494,
    offensive_rating: 64.897,
    defensive_rating: 64.091,
    components: {
      qb_room: 68.8,
      qb_rating: 75,
      return_room: 60.463,
      ol_line: 66.4,
      running_skill: 66.88,
      passing_skill: 62.9,
      balanced_skill: 60.61,
      running_offense: 66.109,
      passing_offense: 65.784,
      balanced_offense: 63.849,
      dl_group: 66.667,
      lb_group: 67,
      secondary_group: 59.25,
    },
    selected_lineups: {
      best_qb: "QB1",
      backup_qb: "QB2",
      running_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      passing_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      balanced_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      kr: "KR",
      pr: "PR",
    },
  },
  {
    team: "bears",
    full_name: "Chicago Bears",
    overall_rating: 63.106,
    offensive_rating: 57.575,
    defensive_rating: 68.636,
    components: {
      qb_room: 37.2,
      qb_rating: 38,
      return_room: 68.65,
      ol_line: 73.8,
      running_skill: 65.04,
      passing_skill: 58.85,
      balanced_skill: 55.602,
      running_offense: 67.766,
      passing_offense: 52.106,
      balanced_offense: 55.214,
      dl_group: 71,
      lb_group: 63,
      secondary_group: 72.5,
    },
    selected_lineups: {
      best_qb: "QB1",
      backup_qb: "QB2",
      running_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      passing_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      balanced_lineup: { RB1: "A", RB2: "B", WR1: "C", WR2: "D", TE1: "E" },
      kr: "KR",
      pr: "PR",
    },
  },
];

describe("team rating utils", () => {
  it("formats team rating percentages to one decimal place", () => {
    expect(formatTeamRating(68.973)).toBe("69.0%");
  });

  it("sorts by any supported rating key using team name as the tie-breaker", () => {
    const sorted = sortTeamRatingsByKey(
      [
        { ...teams[0], overall_rating: 60, full_name: "Zulu Team" },
        { ...teams[1], overall_rating: 60, full_name: "Alpha Team" },
      ],
      "overall_rating",
      "desc",
    );

    expect(sorted.map((team) => team.full_name)).toEqual(["Alpha Team", "Zulu Team"]);
  });

  it("returns top-level and component rating values", () => {
    expect(getTeamRatingSortValue(teams[0], "overall_rating")).toBeCloseTo(68.973);
    expect(getTeamRatingSortValue(teams[0], "passing_offense")).toBeCloseTo(72.118);
  });

  it("builds team page summary cards with ranks based on descending team order", () => {
    expect(getTeamRatingSummaries(teams, "bears")).toEqual([
      { key: "overall_rating", label: "Overall", rank: 3, rating: 63.106 },
      { key: "offensive_rating", label: "Offense", rank: 3, rating: 57.575 },
      { key: "defensive_rating", label: "Defense", rank: 1, rating: 68.636 },
    ]);
  });
});
