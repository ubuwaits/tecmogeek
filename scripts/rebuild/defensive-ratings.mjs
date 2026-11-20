import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
import { formatAggregateFile, formatTeamFile, getPlayerKey, getTeamFileNames, readJson, writeFile } from "./roster-files.mts";
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

async function syncTeamFiles(updatesByGroup) {
  const fileNames = getTeamFileNames();

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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
