import { rebuildRosterPlayers } from "./roster-files.mts";
import { rankPositionPlayers } from "./rank-position-players.mjs";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OFFENSIVE_LINE_POSITIONS = new Set(["C", "LG", "RG", "LT", "RT"]);
const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];
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
    slug: "rushers",
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
    slug: "receivers",
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
    slug: "kick-returners",
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
    slug: "punt-returners",
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
  slug: "ol",
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

function starterSpeed(team, position) {
  const starters = team.players.filter(player => player.position === position);
  if (starters.length !== 1 || !Number.isFinite(starters[0].maximum_speed)) {
    throw new Error(`${team.full_name}: expected one ${position} with a maximum speed.`);
  }
  return starters[0].maximum_speed;
}

async function main() {
  await rebuildRosterPlayers(teams => {
    const skill = [];
    const line = [];
    for (const team of teams) {
      const kickSpeed = starterSpeed(team, "RT");
      const puntSpeed = starterSpeed(team, "SS");
      for (const player of team.players) {
        if (isSkillPosition(player.position)) {
          player.kick_return_maximum_speed = kickSpeed;
          player.punt_return_maximum_speed = puntSpeed;
          skill.push(player);
        } else if (OFFENSIVE_LINE_POSITIONS.has(player.position)) {
          line.push(player);
        }
      }
    }
    for (const config of [...SKILL_CONFIGS, OL_CONFIG]) {
      const mode = config === OL_CONFIG ? "offensiveLine" : "skill";
      const players = config === OL_CONFIG ? line : skill;
      const maxima = buildMaxima(players, config.columns, mode);
      rankPositionPlayers(players, player => computeRating(player, config.columns, maxima, mode),
        config.ratingKey, config.rankingKey);
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
