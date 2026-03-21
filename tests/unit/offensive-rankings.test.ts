import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const DATA_DIR = path.join(process.cwd(), "data");

const OFFENSIVE_LINE_POSITIONS = new Set(["C", "LG", "RG", "LT", "RT"]);
const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];
const OFFENSIVE_HP_SCORE_MAP: Record<number, number> = {
  75: 40,
  81: 60,
  88: 80,
  94: 100,
};

const SKILL_CONFIGS = [
  {
    fileName: "rushers.json",
    ratingKey: "rushing_rating",
    rankingKey: "rushing_ranking",
    columns: [
      { key: "running_speed", weight: 10 },
      { key: "maximum_speed", weight: 70 },
      { key: "hitting_power", weight: 10 },
      { key: "ball_control", weight: 5 },
      { key: "receptions", weight: 5 },
    ],
  },
  {
    fileName: "receivers.json",
    ratingKey: "receiving_rating",
    rankingKey: "receiving_ranking",
    columns: [
      { key: "running_speed", weight: 10 },
      { key: "maximum_speed", weight: 30 },
      { key: "hitting_power", weight: 5 },
      { key: "ball_control", weight: 5 },
      { key: "receptions", weight: 50 },
    ],
  },
  {
    fileName: "kick-returners.json",
    ratingKey: "kick_return_rating",
    rankingKey: "kick_return_ranking",
    columns: [
      { key: "running_speed", weight: 20 },
      { key: "kick_return_maximum_speed", weight: 60 },
      { key: "hitting_power", weight: 10 },
      { key: "ball_control", weight: 10 },
    ],
  },
  {
    fileName: "punt-returners.json",
    ratingKey: "punt_return_rating",
    rankingKey: "punt_return_ranking",
    columns: [
      { key: "running_speed", weight: 20 },
      { key: "punt_return_maximum_speed", weight: 70 },
      { key: "hitting_power", weight: 10 },
    ],
  },
] as const;

const OL_CONFIG = {
  fileName: "ol.json",
  ratingKey: "rating",
  rankingKey: "ranking",
  columns: [
    { key: "maximum_speed", weight: 50 },
    { key: "hitting_power", weight: 50 },
  ],
} as const;

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

function getOffensiveHpScore(hittingPower: number) {
  return OFFENSIVE_HP_SCORE_MAP[hittingPower] ?? 0;
}

function buildMaxima(players: readonly PlayerRecord[], columns: readonly RatingColumn[], hpMode: "skill" | "raw") {
  const maxima: Record<string, number> = {};

  for (const column of columns) {
    if (hpMode === "skill" && column.key === "hitting_power") {
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
  hpMode: "skill" | "raw",
) {
  let total = 0;

  for (const column of columns) {
    let score: number;

    if (hpMode === "skill" && column.key === "hitting_power") {
      score = getOffensiveHpScore(getNumericValue(player, "hitting_power"));
    } else {
      const maximum = maxima[column.key] ?? 0;
      score = maximum === 0 ? 0 : (getNumericValue(player, column.key) / maximum) * 100;
    }

    total += column.weight * (score / 100);
  }

  return Math.round(total);
}

function isSkillPosition(position: string) {
  return SKILL_POSITION_PREFIXES.some((prefix) => position.startsWith(prefix));
}

function getTeamFileNames() {
  return fs
    .readdirSync(DATA_DIR)
    .filter(
      (fileName) =>
        fileName.endsWith(".json") &&
        ![
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
        ].includes(fileName),
    )
    .sort();
}

describe("offensive ratings data", () => {
  it("uses the expected offensive HP score ladder", () => {
    expect(getOffensiveHpScore(13)).toBe(0);
    expect(getOffensiveHpScore(75)).toBe(40);
    expect(getOffensiveHpScore(81)).toBe(60);
    expect(getOffensiveHpScore(88)).toBe(80);
    expect(getOffensiveHpScore(94)).toBe(100);
  });

  it("keeps offensive aggregate ratings aligned with recomputed values", () => {
    for (const config of SKILL_CONFIGS) {
      const players = readJson<PlayerRecord[]>(config.fileName);
      const maxima = buildMaxima(players, config.columns, "skill");

      for (const player of players) {
        expect(parsePercent(player[config.ratingKey])).toBe(
          computeRating(player, config.columns, maxima, "skill"),
        );
      }
    }

    const linemen = readJson<PlayerRecord[]>(OL_CONFIG.fileName);
    const maxima = buildMaxima(linemen, OL_CONFIG.columns, "raw");

    for (const player of linemen) {
      expect(parsePercent(player[OL_CONFIG.ratingKey])).toBe(
        computeRating(player, OL_CONFIG.columns, maxima, "raw"),
      );
    }
  });

  it("keeps aggregate ranking fields aligned with array order and HP tie-breaks", () => {
    for (const config of [...SKILL_CONFIGS, OL_CONFIG]) {
      const players = readJson<PlayerRecord[]>(config.fileName);

      players.forEach((player, index) => {
        expect(player[config.rankingKey]).toBe(index + 1);
      });

      for (let index = 0; index < players.length - 1; index += 1) {
        const current = players[index];
        const next = players[index + 1];
        const currentRating = parsePercent(current[config.ratingKey]);
        const nextRating = parsePercent(next[config.ratingKey]);

        expect(currentRating).toBeGreaterThanOrEqual(nextRating);

        if (currentRating === nextRating) {
          expect(getNumericValue(current, "hitting_power")).toBeGreaterThanOrEqual(
            getNumericValue(next, "hitting_power"),
          );
        }
      }
    }
  });

  it("keeps team offensive ratings and rankings in sync with the aggregate files", () => {
    const skillUpdates = new Map<string, PlayerRecord>();

    for (const config of SKILL_CONFIGS) {
      const players = readJson<PlayerRecord[]>(config.fileName);

      players.forEach((player) => {
        const key = getPlayerKey(player);
        const existing = skillUpdates.get(key) ?? {};

        skillUpdates.set(key, {
          ...existing,
          [config.ratingKey]: player[config.ratingKey],
          [config.rankingKey]: player[config.rankingKey],
        });
      });
    }

    const lineUpdates = new Map<string, PlayerRecord>(
      readJson<PlayerRecord[]>(OL_CONFIG.fileName).map((player) => [
        getPlayerKey(player),
        {
          [OL_CONFIG.ratingKey]: player[OL_CONFIG.ratingKey],
          [OL_CONFIG.rankingKey]: player[OL_CONFIG.rankingKey],
        },
      ]),
    );

    for (const fileName of getTeamFileNames()) {
      const team = readJson<{ players: PlayerRecord[] }>(fileName);

      for (const player of team.players) {
        const key = getPlayerKey(player);

        if (isSkillPosition(String(player.position))) {
          const aggregate = skillUpdates.get(key);
          expect(aggregate, `${fileName} missing skill aggregate entry for ${key}`).toBeDefined();
          expect(player.rushing_rating).toBe(aggregate?.rushing_rating);
          expect(player.rushing_ranking).toBe(aggregate?.rushing_ranking);
          expect(player.receiving_rating).toBe(aggregate?.receiving_rating);
          expect(player.receiving_ranking).toBe(aggregate?.receiving_ranking);
          expect(player.kick_return_rating).toBe(aggregate?.kick_return_rating);
          expect(player.kick_return_ranking).toBe(aggregate?.kick_return_ranking);
          expect(player.punt_return_rating).toBe(aggregate?.punt_return_rating);
          expect(player.punt_return_ranking).toBe(aggregate?.punt_return_ranking);
        }

        if (OFFENSIVE_LINE_POSITIONS.has(String(player.position))) {
          const aggregate = lineUpdates.get(key);
          expect(aggregate, `${fileName} missing OL aggregate entry for ${key}`).toBeDefined();
          expect(player.rating).toBe(aggregate?.rating);
          expect(player.ranking).toBe(aggregate?.ranking);
        }
      }
    }
  });

  it("keeps the representative offensive rating examples correct", () => {
    const rushers = readJson<PlayerRecord[]>("rushers.json");
    const maxima = buildMaxima(rushers, SKILL_CONFIGS[0].columns, "skill");

    const jerryRice = rushers.find((player) => player.team === "49ers" && player.name === "Jerry Rice");
    const boJackson = rushers.find((player) => player.team === "Raiders" && player.name === "Bo Jackson");
    const ottisAnderson = rushers.find(
      (player) => player.team === "Giants" && player.name === "Ottis Anderson",
    );
    const ickeyWoods = rushers.find((player) => player.team === "Bengals" && player.name === "Ickey Woods");

    expect(jerryRice).toBeDefined();
    expect(boJackson).toBeDefined();
    expect(ottisAnderson).toBeDefined();
    expect(ickeyWoods).toBeDefined();

    expect(computeRating(jerryRice!, SKILL_CONFIGS[0].columns, maxima, "skill")).toBe(81);
    expect(computeRating(boJackson!, SKILL_CONFIGS[0].columns, maxima, "skill")).toBe(82);
    expect(computeRating(ottisAnderson!, SKILL_CONFIGS[0].columns, maxima, "skill")).toBe(70);
    expect(computeRating(ickeyWoods!, SKILL_CONFIGS[0].columns, maxima, "skill")).toBe(47);
  });
});
