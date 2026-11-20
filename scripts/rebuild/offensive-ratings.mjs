import {
  OFFENSIVE_HP_SCORE_MAP,
  OFFENSIVE_LINE_HP_SCORE_MAP,
  RUSHING_COLUMNS,
  RECEIVING_COLUMNS,
  KICK_RETURN_COLUMNS,
  PUNT_RETURN_COLUMNS,
  OFFENSIVE_LINE_COLUMNS,
} from "../../lib/players/metrics.ts";
import { applyReturnSpeeds, isReturner } from "../../lib/players/return-speeds.mts";
import { rebuildRosterPlayers } from "./roster-files.mts";
import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OFFENSIVE_LINE_POSITIONS = new Set(["C", "LG", "RG", "LT", "RT"]);
export const SKILL_CONFIGS = [
  {
    name: "rushers",
    slug: "rushers",
    ratingKey: "rushing_rating",
    rankingKey: "rushing_ranking",
    columns: RUSHING_COLUMNS,
  },
  {
    name: "receivers",
    slug: "receivers",
    ratingKey: "receiving_rating",
    rankingKey: "receiving_ranking",
    columns: RECEIVING_COLUMNS,
  },
  {
    name: "kick returners",
    slug: "kick-returners",
    ratingKey: "kick_return_rating",
    rankingKey: "kick_return_ranking",
    columns: KICK_RETURN_COLUMNS,
  },
  {
    name: "punt returners",
    slug: "punt-returners",
    ratingKey: "punt_return_rating",
    rankingKey: "punt_return_ranking",
    columns: PUNT_RETURN_COLUMNS,
  },
].map(config => ({ ...config, hittingPowerScores: OFFENSIVE_HP_SCORE_MAP }));

export const OL_CONFIG = {
  name: "offensive line",
  hittingPowerScores: OFFENSIVE_LINE_HP_SCORE_MAP,
  slug: "ol",
  ratingKey: "rating",
  rankingKey: "ranking",
  columns: OFFENSIVE_LINE_COLUMNS,
};

export { attributeMaxima as buildMaxima, weightedRating as computeRating };

function rankGroup(players, config) {
  const maxima = attributeMaxima(players, config.columns);
  rankPositionPlayers(players, player => weightedRating(player, config.columns, maxima, config.hittingPowerScores),
    config.ratingKey, config.rankingKey);
}

export function rateOffense(teams) {
  const skill = [];
  const line = [];
  for (const team of teams) {
    applyReturnSpeeds(team);
    for (const player of team.players) {
      if (isReturner(player)) {
        skill.push(player);
      } else if (OFFENSIVE_LINE_POSITIONS.has(player.position)) {
        line.push(player);
      }
    }
  }
  for (const config of SKILL_CONFIGS) rankGroup(skill, config);
  rankGroup(line, OL_CONFIG);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  rebuildRosterPlayers(rateOffense).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
