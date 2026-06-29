import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { TEAM_SECTION_CONFIGS } from "@/lib/teams/config";

const DATA_DIR = path.join(process.cwd(), "data");
const AGGREGATE_FILE_NAMES = new Set([
  "qb.json",
  "rushers.json",
  "receivers.json",
  "kick-returners.json",
  "punt-returners.json",
  "ol.json",
  "dl.json",
  "lb.json",
  "cb-s.json",
  "k.json",
  "p.json",
  "team-ratings.json",
]);

type PlayerRecord = Record<string, string | number | undefined>;

function readJson<T>(fileName: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8")) as T;
}

function parsePercent(value: string | number | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return Number.parseInt(String(value ?? "0").replace("%", ""), 10);
}

function getPlayerKey(player: PlayerRecord) {
  return `${player.team}|${player.position}|${player.name}`;
}

function getTeamFileNames() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((fileName) => fileName.endsWith(".json") && !AGGREGATE_FILE_NAMES.has(fileName))
    .sort();
}

function expectKickingAbilityOnlyColumns(columns: unknown) {
  expect(columns).toEqual([
    { key: "kicking_ability", label: "KA", tooltip: "Kicking Ability", weight: 100 },
  ]);
}

function expectAggregateRanksByKickingAbility(fileName: string) {
  const players = readJson<PlayerRecord[]>(fileName);
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

function expectTeamRatingsSyncedWithAggregate(position: "K" | "P", aggregateFileName: string) {
  const updates = new Map<string, PlayerRecord>(
    readJson<PlayerRecord[]>(aggregateFileName).map((player) => [
      getPlayerKey(player),
      {
        rating: player.rating,
        ranking: player.ranking,
      },
    ]),
  );

  for (const fileName of getTeamFileNames()) {
    const team = readJson<{ players: PlayerRecord[] }>(fileName);
    const player = team.players.find((teamPlayer) => teamPlayer.position === position);

    expect(player, `${fileName} is missing ${position}`).toBeDefined();

    const aggregate = updates.get(getPlayerKey(player!));

    expect(aggregate, `${fileName} missing ${position} aggregate entry`).toBeDefined();
    expect(player?.rating).toBe(aggregate?.rating);
    expect(player?.ranking).toBe(aggregate?.ranking);
  }
}

describe("kicking rankings", () => {
  it("documents and displays kickers as Kicking Ability only", () => {
    expect(POSITION_PAGE_CONFIG_MAP.k.note).toContain("Avoid Kick Block has no effect on performance");
    expectKickingAbilityOnlyColumns(POSITION_PAGE_CONFIG_MAP.k.columns);

    const teamKickerSection = TEAM_SECTION_CONFIGS.find((section) => section.id === "k");

    expect(teamKickerSection?.note).toContain("Avoid Kick Block has no effect on performance");
    expect(teamKickerSection?.columns).toEqual(POSITION_PAGE_CONFIG_MAP.k.columns);
  });

  it("documents and displays punters as Kicking Ability only", () => {
    expect(POSITION_PAGE_CONFIG_MAP.p.note).toContain("Punts cannot be blocked");
    expectKickingAbilityOnlyColumns(POSITION_PAGE_CONFIG_MAP.p.columns);

    const teamPunterSection = TEAM_SECTION_CONFIGS.find((section) => section.id === "p");

    expect(teamPunterSection?.note).toContain("Punts cannot be blocked");
    expect(teamPunterSection?.columns).toEqual(POSITION_PAGE_CONFIG_MAP.p.columns);
  });

  it("ranks kickers by Kicking Ability without Avoid Kick Block", () => {
    expectAggregateRanksByKickingAbility("k.json");
  });

  it("ranks punters by Kicking Ability without Avoid Kick Block", () => {
    expectAggregateRanksByKickingAbility("p.json");
  });

  it("keeps team kicker ratings and rankings in sync with the aggregate file", () => {
    expectTeamRatingsSyncedWithAggregate("K", "k.json");
  });

  it("keeps team punter ratings and rankings in sync with the aggregate file", () => {
    expectTeamRatingsSyncedWithAggregate("P", "p.json");
  });
});
