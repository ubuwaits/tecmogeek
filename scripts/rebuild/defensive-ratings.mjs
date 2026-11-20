import {
  DEFENSIVE_HP_SCORE_MAP,
  DEFENSIVE_LINE_COLUMNS,
  LINEBACKER_COLUMNS,
  SECONDARY_COLUMNS,
} from "../../lib/players/metrics.ts";
import { rebuildRosterPlayers } from "./roster-files.mts";
import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFENSIVE_CONFIGS = [
  {
    name: "defensive line",
    slug: "dl",
    positions: new Set(["RE", "NT", "LE"]),
    columns: DEFENSIVE_LINE_COLUMNS,
  },
  {
    name: "linebackers",
    slug: "lb",
    positions: new Set(["ROLB", "RILB", "LILB", "LOLB"]),
    columns: LINEBACKER_COLUMNS,
  },
  {
    name: "secondary",
    slug: "cb-s",
    positions: new Set(["RCB", "LCB", "FS", "SS"]),
    columns: SECONDARY_COLUMNS,
  },
];

export function buildMaxima(players, columns) {
  return attributeMaxima(players, columns);
}

export function computeRating(player, columns, maxima) {
  return weightedRating(player, columns, maxima, DEFENSIVE_HP_SCORE_MAP);
}

export function rateDefense(teams) {
  const roster = teams.flatMap(team => team.players);
  for (const config of DEFENSIVE_CONFIGS) {
    const players = roster.filter(player => config.positions.has(player.position));
    const maxima = buildMaxima(players, config.columns);
    rankPositionPlayers(players, player => computeRating(player, config.columns, maxima), "rating", "ranking");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  rebuildRosterPlayers(rateDefense).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
