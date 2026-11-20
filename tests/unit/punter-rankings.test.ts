import { leaderboard } from "../helpers/leaderboards";

import { describe, expect, it } from "vitest";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { TEAM_SECTION_CONFIGS } from "@/lib/teams/config";

function parsePercent(value: string | number | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return Number.parseInt(String(value ?? "0").replace("%", ""), 10);
}

function expectKickingAbilityOnlyColumns(columns: unknown) {
  expect(columns).toEqual([
    { key: "kicking_ability", label: "KA", tooltip: "Kicking Ability", weight: 100 },
  ]);
}

function expectRanksByKickingAbility(slug: "k" | "p") {
  const players = leaderboard(slug);
  const maxKickingAbility = Math.max(...players.map((player) => Number(player.kicking_ability ?? 0)));

  players.forEach((player, index) => {
    const expectedRating = Math.round((Number(player.kicking_ability ?? 0) / maxKickingAbility) * 100);

    expect(parsePercent(player.rating)).toBe(expectedRating);
    expect(player.ranking).toBe(index + 1);
  });

  for (let index = 0; index < players.length - 1; index += 1) {
    expect(Number(players[index]?.kicking_ability ?? 0)).toBeGreaterThanOrEqual(
      Number(players[index + 1]?.kicking_ability ?? 0),
    );
  }
}

describe("kicking rankings", () => {
  it("documents and displays kickers as Kicking Ability only", () => {
    expect(POSITION_PAGE_CONFIG_MAP.k.note).toContain("Avoid Kick Block has no effect on performance");
    expectKickingAbilityOnlyColumns(POSITION_PAGE_CONFIG_MAP.k.columns);

    const teamKickerSection = TEAM_SECTION_CONFIGS.find((section) => section.id === "k");

    expect(teamKickerSection?.note).toContain("Avoid Kick Block has no effect on performance");
    expect(teamKickerSection?.playerPage).toBe("k");
  });

  it("documents and displays punters as Kicking Ability only", () => {
    expect(POSITION_PAGE_CONFIG_MAP.p.note).toContain("Punts cannot be blocked");
    expectKickingAbilityOnlyColumns(POSITION_PAGE_CONFIG_MAP.p.columns);

    const teamPunterSection = TEAM_SECTION_CONFIGS.find((section) => section.id === "p");

    expect(teamPunterSection?.note).toContain("Punts cannot be blocked");
    expect(teamPunterSection?.playerPage).toBe("p");
  });

  it("ranks kickers by Kicking Ability without Avoid Kick Block", () => {
    expectRanksByKickingAbility("k");
  });

  it("ranks punters by Kicking Ability without Avoid Kick Block", () => {
    expectRanksByKickingAbility("p");
  });
});
