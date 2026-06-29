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

describe("punter rankings", () => {
  it("documents and displays punters as Kicking Ability only", () => {
    expect(POSITION_PAGE_CONFIG_MAP.p.note).toContain("Punts cannot be blocked");
    expect(POSITION_PAGE_CONFIG_MAP.p.columns).toEqual([
      { key: "kicking_ability", label: "KA", tooltip: "Kicking Ability", weight: 100 },
    ]);

    const teamPunterSection = TEAM_SECTION_CONFIGS.find((section) => section.id === "p");

    expect(teamPunterSection?.note).toContain("Punts cannot be blocked");
    expect(teamPunterSection?.columns).toEqual(POSITION_PAGE_CONFIG_MAP.p.columns);
  });

  it("ranks punters by Kicking Ability without Avoid Kick Block", () => {
    const punters = readJson<PlayerRecord[]>("p.json");
    const maxKickingAbility = Math.max(...punters.map((player) => Number(player.kicking_ability ?? 0)));

    punters.forEach((player, index) => {
      const expectedRating = Math.round((Number(player.kicking_ability ?? 0) / maxKickingAbility) * 100);

      expect(parsePercent(player.rating)).toBe(expectedRating);
      expect(player.ranking).toBe(index + 1);
    });

    for (let index = 0; index < punters.length - 1; index += 1) {
      expect(Number(punters[index]?.kicking_ability ?? 0)).toBeGreaterThanOrEqual(
        Number(punters[index + 1]?.kicking_ability ?? 0),
      );
    }
  });

  it("keeps team punter ratings and rankings in sync with the aggregate file", () => {
    const punterUpdates = new Map<string, PlayerRecord>(
      readJson<PlayerRecord[]>("p.json").map((player) => [
        getPlayerKey(player),
        {
          rating: player.rating,
          ranking: player.ranking,
        },
      ]),
    );

    for (const fileName of getTeamFileNames()) {
      const team = readJson<{ players: PlayerRecord[] }>(fileName);
      const punter = team.players.find((player) => player.position === "P");

      expect(punter, `${fileName} is missing a punter`).toBeDefined();

      const aggregate = punterUpdates.get(getPlayerKey(punter!));

      expect(aggregate, `${fileName} missing punter aggregate entry`).toBeDefined();
      expect(punter?.rating).toBe(aggregate?.rating);
      expect(punter?.ranking).toBe(aggregate?.ranking);
    }
  });
});
