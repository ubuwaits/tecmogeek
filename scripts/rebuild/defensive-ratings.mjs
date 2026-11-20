import { syncRosterRatings } from "./sync-roster-ratings.mjs";
import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
import { formatAggregateFile, readJson, writeFile } from "./roster-files.mts";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFENSIVE_HP_SCORE_MAP = {
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

export const DEFENSIVE_CONFIGS = [
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

export function buildMaxima(players, columns) {
  return attributeMaxima(players, columns, false);
}

export function computeRating(player, columns, maxima) {
  return weightedRating(player, columns, maxima, DEFENSIVE_HP_SCORE_MAP);
}

async function rebuildDefensiveAggregate(config) {
  const sourceRows = await readJson(config.fileName);
  const maxima = buildMaxima(sourceRows, config.columns);
  const { rebuiltRows, updates } = rankPositionPlayers(sourceRows, player =>
    computeRating(player, config.columns, maxima),
  );

  await writeFile(config.fileName, formatAggregateFile(rebuiltRows));

  return updates;
}

async function main() {
  const groups = [];
  for (const config of DEFENSIVE_CONFIGS) {
    groups.push({
      name: config.name,
      matches: position => config.positions.has(position),
      updates: await rebuildDefensiveAggregate(config),
    });
  }

  await syncRosterRatings(groups);

  const counts = groups.map(({ name, updates }) => `${updates.size} ${name}`);
  console.log(`Rebuilt defensive ratings for ${counts.join(", ")}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
