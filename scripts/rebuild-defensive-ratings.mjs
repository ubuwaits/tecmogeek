import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

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

const DEFENSIVE_HP_SCORE_MAP = {
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
    name: "defensive line",
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
    name: "linebackers",
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
    name: "secondary",
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
];

function getPlayerKey(player) {
  return `${player.team}|${player.position}|${player.name}`;
}

function getNumericValue(player, key) {
  return Number(player[key] ?? 0);
}

function getDefensiveHpScore(hittingPower) {
  return DEFENSIVE_HP_SCORE_MAP[hittingPower] ?? 0;
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

function buildMaxima(players, columns) {
  const maxima = {};

  for (const column of columns) {
    if (column.key === "hitting_power") {
      continue;
    }

    maxima[column.key] = Math.max(...players.map((player) => getNumericValue(player, column.key)));
  }

  return maxima;
}

function computeRating(player, columns, maxima) {
  let total = 0;

  for (const column of columns) {
    let score;

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

async function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeFile(fileName, contents) {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, contents, "utf8");
}

async function rebuildDefensiveAggregate(config) {
  const sourceRows = await readJson(config.fileName);
  const maxima = buildMaxima(sourceRows, config.columns);
  const updates = new Map();

  const rebuiltRows = sourceRows
    .map((player, sourceIndex) => ({
      player,
      sourceIndex,
      rating: computeRating(player, config.columns, maxima),
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
        rating: formatPercent(rating),
        ranking: index + 1,
      };

      updates.set(getPlayerKey(player), {
        rating: nextPlayer.rating,
        ranking: nextPlayer.ranking,
      });

      return nextPlayer;
    });

  await writeFile(config.fileName, formatAggregateFile(rebuiltRows));

  return updates;
}

async function syncTeamFiles(updatesByGroup) {
  const fileNames = (await fs.readdir(DATA_DIR))
    .filter((fileName) => fileName.endsWith(".json") && !AGGREGATE_FILE_NAMES.has(fileName))
    .sort();

  const seenKeysByGroup = new Map(DEFENSIVE_CONFIGS.map((config) => [config.name, new Set()]));

  for (const fileName of fileNames) {
    const team = await readJson(fileName);

    team.players.forEach((player) => {
      const config = DEFENSIVE_CONFIGS.find((candidate) => candidate.positions.has(player.position));

      if (!config) {
        return;
      }

      const key = getPlayerKey(player);
      const update = updatesByGroup.get(config.name)?.get(key);

      if (!update) {
        throw new Error(`Missing ${config.name} update for ${key} in ${fileName}.`);
      }

      Object.assign(player, update);
      seenKeysByGroup.get(config.name)?.add(key);
    });

    await writeFile(fileName, formatTeamFile(team));
  }

  for (const config of DEFENSIVE_CONFIGS) {
    const seenKeys = seenKeysByGroup.get(config.name);
    const updates = updatesByGroup.get(config.name);

    if (seenKeys?.size !== updates?.size) {
      throw new Error(
        `Updated ${seenKeys?.size ?? 0} ${config.name} players in team files, expected ${updates?.size ?? 0}.`,
      );
    }
  }
}

async function main() {
  const updatesByGroup = new Map();

  for (const config of DEFENSIVE_CONFIGS) {
    updatesByGroup.set(config.name, await rebuildDefensiveAggregate(config));
  }

  await syncTeamFiles(updatesByGroup);

  console.log(
    `Rebuilt defensive ratings for ${DEFENSIVE_CONFIGS.map(
      (config) => `${updatesByGroup.get(config.name)?.size ?? 0} ${config.name}`,
    ).join(", ")}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
