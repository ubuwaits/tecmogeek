import { rebuildRosterPlayers } from "./roster-files.mts";
import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
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
    slug: "dl",
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
    slug: "lb",
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
    slug: "cb-s",
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
  return attributeMaxima(players, columns);
}

export function computeRating(player, columns, maxima) {
  return weightedRating(player, columns, maxima, DEFENSIVE_HP_SCORE_MAP);
}

async function main() {
  await rebuildRosterPlayers(teams => {
    const roster = teams.flatMap(team => team.players);
    for (const config of DEFENSIVE_CONFIGS) {
      const players = roster.filter(player => config.positions.has(player.position));
      const maxima = buildMaxima(players, config.columns);
      rankPositionPlayers(players, player => computeRating(player, config.columns, maxima), "rating", "ranking");
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
