import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const OFFENSIVE_LINE_POSITIONS = new Set(["C", "LG", "RG", "LT", "RT"]);
const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];
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
]);

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

const OFFENSIVE_HP_SCORE_MAP = {
  75: 40,
  81: 60,
  88: 80,
  94: 100,
};

const SKILL_CONFIGS = [
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
      { key: "maximum_speed", weight: 30 },
      { key: "hitting_power", weight: 5 },
      { key: "ball_control", weight: 5 },
      { key: "receptions", weight: 50 },
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

const OL_CONFIG = {
  name: "offensive line",
  fileName: "ol.json",
  ratingKey: "rating",
  rankingKey: "ranking",
  columns: [
    { key: "maximum_speed", weight: 50 },
    { key: "hitting_power", weight: 50 },
  ],
};

function getPlayerKey(player) {
  return `${player.team}|${player.position}|${player.name}`;
}

function getNumericValue(player, key) {
  return Number(player[key] ?? 0);
}

function getOffensiveHpScore(hittingPower) {
  return OFFENSIVE_HP_SCORE_MAP[hittingPower] ?? 0;
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function formatAggregateFile(rows) {
  return `[${rows.map((row) => JSON.stringify(row)).join(",\n")}]\n`;
}

function formatTeamFile(team) {
  const players = team.players.map((player) => `    ${JSON.stringify(player)}`).join(",\n");

  return `{\n  "full_name": ${JSON.stringify(team.full_name)},\n  "short_name": ${JSON.stringify(team.short_name)},\n  "players": [\n${players}\n  ]\n}\n`;
}

function isSkillPosition(position) {
  return SKILL_POSITION_PREFIXES.some((prefix) => position.startsWith(prefix));
}

function buildMaxima(players, columns, hpMode) {
  const maxima = {};

  for (const column of columns) {
    if (hpMode === "skill" && column.key === "hitting_power") {
      continue;
    }

    maxima[column.key] = Math.max(...players.map((player) => getNumericValue(player, column.key)));
  }

  return maxima;
}

function computeRating(player, columns, maxima, hpMode) {
  let total = 0;

  for (const column of columns) {
    let score;

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

function assertSkillAttributesMatch(canonicalPlayer, comparisonPlayer, fileName) {
  for (const key of SKILL_ATTRIBUTE_KEYS) {
    if (canonicalPlayer[key] !== comparisonPlayer[key]) {
      throw new Error(
        `Skill aggregate mismatch for ${fileName}: ${getPlayerKey(comparisonPlayer)} has a different ${key} value.`,
      );
    }
  }
}

async function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeFile(fileName, contents) {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, contents, "utf8");
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
      .sort((left, right) => {
        if (left.rating !== right.rating) {
          return right.rating - left.rating;
        }

        if (left.hittingPower !== right.hittingPower) {
          return right.hittingPower - left.hittingPower;
        }

        return left.sourceIndex - right.sourceIndex;
      })
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
  const maxima = buildMaxima(sourceRows, OL_CONFIG.columns, "raw");
  const updates = new Map();

  const rebuiltRows = sourceRows
    .map((player, sourceIndex) => ({
      player,
      sourceIndex,
      rating: computeRating(player, OL_CONFIG.columns, maxima, "raw"),
      hittingPower: getNumericValue(player, "hitting_power"),
    }))
    .sort((left, right) => {
      if (left.rating !== right.rating) {
        return right.rating - left.rating;
      }

      if (left.hittingPower !== right.hittingPower) {
        return right.hittingPower - left.hittingPower;
      }

      return left.sourceIndex - right.sourceIndex;
    })
    .map(({ player, rating }, index) => {
      const nextPlayer = {
        ...player,
        [OL_CONFIG.ratingKey]: formatPercent(rating),
        [OL_CONFIG.rankingKey]: index + 1,
      };

      updates.set(getPlayerKey(player), {
        [OL_CONFIG.ratingKey]: nextPlayer[OL_CONFIG.ratingKey],
        [OL_CONFIG.rankingKey]: nextPlayer[OL_CONFIG.rankingKey],
      });

      return nextPlayer;
    });

  await writeFile(OL_CONFIG.fileName, formatAggregateFile(rebuiltRows));

  return updates;
}

async function syncTeamFiles(skillFieldUpdates, olUpdates) {
  const fileNames = (await fs.readdir(DATA_DIR))
    .filter((fileName) => fileName.endsWith(".json") && !AGGREGATE_FILE_NAMES.has(fileName))
    .sort();

  const seenSkillKeys = new Set();
  const seenOlKeys = new Set();

  for (const fileName of fileNames) {
    const team = await readJson(fileName);

    team.players.forEach((player) => {
      const key = getPlayerKey(player);

      if (isSkillPosition(player.position)) {
        const update = skillFieldUpdates.get(key);

        if (!update) {
          throw new Error(`Missing offensive skill update for ${key} in ${fileName}.`);
        }

        Object.assign(player, update);
        seenSkillKeys.add(key);
        return;
      }

      if (OFFENSIVE_LINE_POSITIONS.has(player.position)) {
        const update = olUpdates.get(key);

        if (!update) {
          throw new Error(`Missing offensive line update for ${key} in ${fileName}.`);
        }

        Object.assign(player, update);
        seenOlKeys.add(key);
      }
    });

    await writeFile(fileName, formatTeamFile(team));
  }

  if (seenSkillKeys.size !== skillFieldUpdates.size) {
    throw new Error(
      `Updated ${seenSkillKeys.size} offensive skill players in team files, expected ${skillFieldUpdates.size}.`,
    );
  }

  if (seenOlKeys.size !== olUpdates.size) {
    throw new Error(
      `Updated ${seenOlKeys.size} offensive linemen in team files, expected ${olUpdates.size}.`,
    );
  }
}

async function main() {
  const skillFieldUpdates = await rebuildSkillAggregates();
  const olUpdates = await rebuildOlAggregate();

  await syncTeamFiles(skillFieldUpdates, olUpdates);

  console.log(
    `Rebuilt offensive ratings for ${skillFieldUpdates.size} skill players and ${olUpdates.size} offensive linemen.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
