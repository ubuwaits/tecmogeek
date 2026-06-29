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

const DEFENSIVE_HP_SCORE_MAP: Record<number, number> = {
  19: 0,
  25: 7,
  31: 16,
  38: 23,
  44: 30,
  50: 36,
  56: 45,
  63: 59,
  69: 78,
  75: 100,
};

const DEFENSIVE_CONFIGS = [
  {
    id: "dl",
    fileName: "dl.json",
    positions: new Set(["RE", "NT", "LE"]),
    columns: [
      { key: "running_speed", weight: 10 },
      { key: "rushing_power", weight: 35 },
      { key: "maximum_speed", weight: 10 },
      { key: "hitting_power", weight: 40 },
      { key: "pass_interceptions", weight: 5 },
    ],
  },
  {
    id: "lb",
    fileName: "lb.json",
    positions: new Set(["ROLB", "RILB", "LILB", "LOLB"]),
    columns: [
      { key: "running_speed", weight: 10 },
      { key: "rushing_power", weight: 35 },
      { key: "maximum_speed", weight: 10 },
      { key: "hitting_power", weight: 30 },
      { key: "pass_interceptions", weight: 15 },
    ],
  },
  {
    id: "secondary",
    fileName: "cb-s.json",
    positions: new Set(["RCB", "LCB", "FS", "SS"]),
    columns: [
      { key: "running_speed", weight: 10 },
      { key: "rushing_power", weight: 35 },
      { key: "maximum_speed", weight: 10 },
      { key: "hitting_power", weight: 5 },
      { key: "pass_interceptions", weight: 40 },
    ],
  },
] as const;

type RatingColumn = {
  key: string;
  weight: number;
};

type PlayerRecord = Record<string, string | number | undefined>;

function readJson<T>(fileName: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8")) as T;
}

function getPlayerKey(player: PlayerRecord) {
  return `${player.team}|${player.position}|${player.name}`;
}

function getNumericValue(player: PlayerRecord, key: string) {
  return Number(player[key] ?? 0);
}

function parsePercent(value: string | number | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return Number.parseInt(String(value ?? "0").replace("%", ""), 10);
}

function getDefensiveHpScore(hittingPower: number) {
  return DEFENSIVE_HP_SCORE_MAP[hittingPower] ?? 0;
}

function buildMaxima(players: readonly PlayerRecord[], columns: readonly RatingColumn[]) {
  const maxima: Record<string, number> = {};

  for (const column of columns) {
    if (column.key === "hitting_power") {
      continue;
    }

    maxima[column.key] = Math.max(...players.map((player) => getNumericValue(player, column.key)));
  }

  return maxima;
}

function computeRating(
  player: PlayerRecord,
  columns: readonly RatingColumn[],
  maxima: Record<string, number>,
) {
  let total = 0;

  for (const column of columns) {
    let score: number;

    if (column.key === "hitting_power") {
      score = getDefensiveHpScore(getNumericValue(player, "hitting_power"));
    } else {
      const maximum = maxima[column.key] ?? 0;
      score = maximum === 0 ? 0 : (getNumericValue(player, column.key) / maximum) * 100;
    }

    total += column.weight * (score / 100);
  }

  return Math.round(total);
}

function getTeamFileNames() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((fileName) => fileName.endsWith(".json") && !AGGREGATE_FILE_NAMES.has(fileName))
    .sort();
}

describe("defensive ratings data", () => {
  it("uses the expected defensive HP score ladder", () => {
    expect(getDefensiveHpScore(19)).toBe(0);
    expect(getDefensiveHpScore(25)).toBe(7);
    expect(getDefensiveHpScore(31)).toBe(16);
    expect(getDefensiveHpScore(38)).toBe(23);
    expect(getDefensiveHpScore(44)).toBe(30);
    expect(getDefensiveHpScore(50)).toBe(36);
    expect(getDefensiveHpScore(56)).toBe(45);
    expect(getDefensiveHpScore(63)).toBe(59);
    expect(getDefensiveHpScore(69)).toBe(78);
    expect(getDefensiveHpScore(75)).toBe(100);
  });

  it("documents defensive HP score bands on player and team pages", () => {
    expect(POSITION_PAGE_CONFIG_MAP.dl.note).toContain("HP score bands");
    expect(POSITION_PAGE_CONFIG_MAP.lb.note).toContain("69 = 78%");
    expect(POSITION_PAGE_CONFIG_MAP["cb-s"].note).toContain("75 = 100%");

    for (const id of ["dl", "lb", "secondary"]) {
      const section = TEAM_SECTION_CONFIGS.find((candidate) => candidate.id === id);

      expect(section?.note).toContain("HP score bands");
    }
  });

  it("keeps defensive aggregate ratings aligned with recomputed values", () => {
    for (const config of DEFENSIVE_CONFIGS) {
      const players = readJson<PlayerRecord[]>(config.fileName);
      const maxima = buildMaxima(players, config.columns);

      for (const player of players) {
        expect(parsePercent(player.rating)).toBe(computeRating(player, config.columns, maxima));
      }
    }
  });

  it("keeps defensive aggregate rankings aligned with array order and HP tie-breaks", () => {
    for (const config of DEFENSIVE_CONFIGS) {
      const players = readJson<PlayerRecord[]>(config.fileName);

      players.forEach((player, index) => {
        expect(player.ranking).toBe(index + 1);
      });

      for (let index = 0; index < players.length - 1; index += 1) {
        const current = players[index];
        const next = players[index + 1];
        const currentRating = parsePercent(current.rating);
        const nextRating = parsePercent(next.rating);

        expect(currentRating).toBeGreaterThanOrEqual(nextRating);

        if (currentRating === nextRating) {
          expect(getNumericValue(current, "hitting_power")).toBeGreaterThanOrEqual(
            getNumericValue(next, "hitting_power"),
          );
        }
      }
    }
  });

  it("keeps team defensive ratings and rankings in sync with the aggregate files", () => {
    const updates = new Map<string, PlayerRecord>();

    for (const config of DEFENSIVE_CONFIGS) {
      readJson<PlayerRecord[]>(config.fileName).forEach((player) => {
        updates.set(getPlayerKey(player), {
          rating: player.rating,
          ranking: player.ranking,
        });
      });
    }

    for (const fileName of getTeamFileNames()) {
      const team = readJson<{ players: PlayerRecord[] }>(fileName);

      for (const player of team.players) {
        const position = String(player.position);

        if (!DEFENSIVE_CONFIGS.some((config) => config.positions.has(position))) {
          continue;
        }

        const aggregate = updates.get(getPlayerKey(player));

        expect(aggregate, `${fileName} missing defensive aggregate entry for ${getPlayerKey(player)}`).toBeDefined();
        expect(player.rating).toBe(aggregate?.rating);
        expect(player.ranking).toBe(aggregate?.ranking);
      }
    }
  });
});
