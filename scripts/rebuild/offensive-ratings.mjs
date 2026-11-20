import { syncRosterRatings } from "./sync-roster-ratings.mjs";
import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, formatPercent, getNumericValue, weightedRating } from "./player-rating.mjs";
import { comparePlayerRanks } from "./compare-player-ranks.mjs";
import { formatAggregateFile, getPlayerKey, readJson, writeFile } from "./roster-files.mts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OFFENSIVE_LINE_POSITIONS = new Set(["C", "LG", "RG", "LT", "RT"]);
const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];
const SKILL_ATTRIBUTE_KEYS = [
  "team",
  "position",
  "name",
  "number",
  "running_speed",
  "maximum_speed",
  "kick_return_maximum_speed",
  "punt_return_maximum_speed",
  "hitting_power",
  "ball_control",
  "receptions",
];

export const OFFENSIVE_HP_SCORE_MAP = {
  75: 5,
  81: 25,
  88: 60,
  94: 100,
};

export const OFFENSIVE_LINE_HP_SCORE_MAP = {
  31: 0,
  38: 15,
  44: 30,
  50: 45,
  56: 55,
  63: 65,
  69: 80,
  75: 90,
  81: 100,
};

export const SKILL_CONFIGS = [
  {
    name: "rushers",
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
    name: "receivers",
    fileName: "receivers.json",
    ratingKey: "receiving_rating",
    rankingKey: "receiving_ranking",
    columns: [
      { key: "running_speed", weight: 10 },
      { key: "maximum_speed", weight: 45 },
      { key: "hitting_power", weight: 5 },
      { key: "ball_control", weight: 5 },
      { key: "receptions", weight: 35 },
    ],
  },
  {
    name: "kick returners",
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
    name: "punt returners",
    fileName: "punt-returners.json",
    ratingKey: "punt_return_rating",
    rankingKey: "punt_return_ranking",
    columns: [
      { key: "running_speed", weight: 20 },
      { key: "punt_return_maximum_speed", weight: 70 },
      { key: "hitting_power", weight: 10 },
    ],
  },
];

export const OL_CONFIG = {
  name: "offensive line",
  fileName: "ol.json",
  ratingKey: "rating",
  rankingKey: "ranking",
  columns: [
    { key: "maximum_speed", weight: 20 },
    { key: "hitting_power", weight: 80 },
  ],
};

function isSkillPosition(position) {
  return SKILL_POSITION_PREFIXES.some((prefix) => position.startsWith(prefix));
}

export function buildMaxima(players, columns, hpMode) {
  return attributeMaxima(players, columns, hpMode === "raw");
}

export function computeRating(player, columns, maxima, hpMode) {
  let scores;
  if (hpMode === "skill") scores = OFFENSIVE_HP_SCORE_MAP;
  if (hpMode === "offensiveLine") scores = OFFENSIVE_LINE_HP_SCORE_MAP;
  return weightedRating(player, columns, maxima, scores);
}

function assertSkillAttributesMatch(canonicalPlayer, comparisonPlayer, fileName) {
  for (const key of SKILL_ATTRIBUTE_KEYS) {
    if (canonicalPlayer[key] !== comparisonPlayer[key]) {
      throw new Error(
        `Skill aggregate mismatch for ${fileName}: ${getPlayerKey(comparisonPlayer)} has a different ${key} value.`,
      );
    }
  }
}

async function rebuildSkillAggregates() {
  const canonicalRows = await readJson(SKILL_CONFIGS[0].fileName);
  const canonicalByKey = new Map();

  for (const player of canonicalRows) {
    const key = getPlayerKey(player);

    if (canonicalByKey.has(key)) {
      throw new Error(`Duplicate player in ${SKILL_CONFIGS[0].fileName}: ${key}`);
    }

    canonicalByKey.set(key, { ...player });
  }

  const skillFieldUpdates = new Map();
  const sortedKeysByFile = new Map();

  for (const config of SKILL_CONFIGS) {
    const sourceRows = await readJson(config.fileName);

    if (sourceRows.length !== canonicalRows.length) {
      throw new Error(
        `${config.fileName} has ${sourceRows.length} players, expected ${canonicalRows.length}.`,
      );
    }

    const seenKeys = new Set();
    const maxima = buildMaxima(canonicalRows, config.columns, "skill");
    const ratingByKey = new Map();

    for (const player of canonicalRows) {
      ratingByKey.set(getPlayerKey(player), computeRating(player, config.columns, maxima, "skill"));
    }

    const sortedKeys = sourceRows
      .map((player, sourceIndex) => {
        const key = getPlayerKey(player);
        const canonicalPlayer = canonicalByKey.get(key);

        if (!canonicalPlayer) {
          throw new Error(`${config.fileName} includes unknown player ${key}.`);
        }

        if (seenKeys.has(key)) {
          throw new Error(`Duplicate player in ${config.fileName}: ${key}`);
        }

        seenKeys.add(key);
        assertSkillAttributesMatch(canonicalPlayer, player, config.fileName);

        return {
          key,
          sourceIndex,
          rating: ratingByKey.get(key) ?? 0,
          hittingPower: getNumericValue(player, "hitting_power"),
        };
      })
      .sort(comparePlayerRanks)
      .map(({ key }, index) => {
        const existing = skillFieldUpdates.get(key) ?? {};
        const rating = ratingByKey.get(key) ?? 0;

        skillFieldUpdates.set(key, {
          ...existing,
          [config.ratingKey]: formatPercent(rating),
          [config.rankingKey]: index + 1,
        });

        return key;
      });

    if (seenKeys.size !== canonicalRows.length) {
      throw new Error(`${config.fileName} is missing one or more offensive skill players.`);
    }

    sortedKeysByFile.set(config.fileName, sortedKeys);
  }

  for (const config of SKILL_CONFIGS) {
    const sortedKeys = sortedKeysByFile.get(config.fileName);

    if (!sortedKeys) {
      throw new Error(`No sorted data generated for ${config.fileName}.`);
    }

    const rebuiltRows = sortedKeys.map((key) => ({
      ...canonicalByKey.get(key),
      ...skillFieldUpdates.get(key),
    }));

    await writeFile(config.fileName, formatAggregateFile(rebuiltRows));
  }

  return skillFieldUpdates;
}

async function rebuildOlAggregate() {
  const sourceRows = await readJson(OL_CONFIG.fileName);
  const maxima = buildMaxima(sourceRows, OL_CONFIG.columns, "offensiveLine");
  const { rebuiltRows, updates } = rankPositionPlayers(sourceRows, player =>
    computeRating(player, OL_CONFIG.columns, maxima, "offensiveLine"),
  );

  await writeFile(OL_CONFIG.fileName, formatAggregateFile(rebuiltRows));

  return updates;
}

async function main() {
  const skillFieldUpdates = await rebuildSkillAggregates();
  const olUpdates = await rebuildOlAggregate();

  await syncRosterRatings([
    { name: "offensive skill", matches: isSkillPosition, updates: skillFieldUpdates },
    { name: "offensive line", matches: position => OFFENSIVE_LINE_POSITIONS.has(position), updates: olUpdates },
  ]);

  console.log(
    `Rebuilt offensive ratings for ${skillFieldUpdates.size} skill players and ${olUpdates.size} offensive linemen.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
