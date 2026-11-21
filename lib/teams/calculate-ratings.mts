import type { TeamData, TeamRatingRecord, TeamSlug } from "../types.ts";
import { createOffensiveSkillLineups, formatOffensiveSkillLineup } from "./offensive-lineups.mts";
import {
  getPlayerLabel, getPlayerRating, isSkillPlayer, compareRating,
  type PlayerRecord,
} from "./team-rating-players.mts";

export {
  compareLineupScores, createOffensiveSkillLineups, FLOAT_TOLERANCE, hasHighRunningPower, lineupScore,
} from "./offensive-lineups.mts";

const OFFENSIVE_LINE_POSITIONS = ["C", "LG", "RG", "LT", "RT"];
export const DEFENSIVE_UNITS = {
  line: { positions: ["RE", "NT", "LE"], weight: 3 },
  linebackers: { positions: ["ROLB", "RILB", "LILB", "LOLB"], weight: 4 },
  secondary: { positions: ["RCB", "LCB", "FS", "SS"], weight: 4 },
} as const;
export const DEFENSIVE_STARTER_COUNT = 11;

type QuarterbackRoomResult = {
  score: number;
  bestQb: PlayerRecord;
  backupQb: PlayerRecord;
};

type ReturnRoomResult = {
  score: number;
  kickReturnScore: number;
  puntReturnScore: number;
  kickReturner: PlayerRecord;
  puntReturner: PlayerRecord;
};

type DefensiveGroupsResult = {
  dlGroup: number;
  lbGroup: number;
  secondaryGroup: number;
  score: number;
};

function roundTo(value: number, decimals = 3): number {
  return Number(value.toFixed(decimals));
}

function weightedAverage(parts: readonly { weight: number; value: number }[]): number {
  return parts.reduce((total, part) => total + part.weight * part.value, 0);
}

function average(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getGroupPlayers(players: readonly PlayerRecord[], positions: readonly string[], groupName: string) {
  const groupPlayers = players.filter((player) => positions.includes(player.position));
  for (const position of positions) {
    const count = groupPlayers.filter((player) => player.position === position).length;
    if (count !== 1) {
      throw new Error(`Expected exactly one ${position} in ${groupName}, received ${count}.`);
    }
  }
  return groupPlayers;
}

export function createQuarterbackRoom(players: readonly PlayerRecord[]): QuarterbackRoomResult {
  const quarterbacks = players.filter(player => player.position.startsWith("QB"));

  if (quarterbacks.length !== 2) {
    throw new Error(`Expected 2 quarterbacks, received ${quarterbacks.length}.`);
  }

  const [bestQb, backupQb] = quarterbacks.sort(compareRating("rating"));

  return {
    score: weightedAverage([
      { weight: 0.8, value: getPlayerRating(bestQb, "rating") },
      { weight: 0.2, value: getPlayerRating(backupQb, "rating") },
    ]),
    bestQb,
    backupQb,
  };
}

export function createReturnRoom(players: readonly PlayerRecord[]): ReturnRoomResult {
  const skillPlayers = players.filter(isSkillPlayer);

  if (skillPlayers.length < 2) {
    throw new Error(`Expected at least 2 skill players, received ${skillPlayers.length}.`);
  }

  const kickReturners = skillPlayers.toSorted(compareRating("kick_return_rating"));
  const puntReturners = skillPlayers.toSorted(compareRating("punt_return_rating"));
  const kickReturnScore = weightedAverage([
    { weight: 0.75, value: getPlayerRating(kickReturners[0], "kick_return_rating") },
    { weight: 0.25, value: getPlayerRating(kickReturners[1], "kick_return_rating") },
  ]);
  const puntReturnScore = weightedAverage([
    { weight: 0.75, value: getPlayerRating(puntReturners[0], "punt_return_rating") },
    { weight: 0.25, value: getPlayerRating(puntReturners[1], "punt_return_rating") },
  ]);

  return {
    score: weightedAverage([
      { weight: 0.55, value: kickReturnScore },
      { weight: 0.45, value: puntReturnScore },
    ]),
    kickReturnScore,
    puntReturnScore,
    kickReturner: kickReturners[0],
    puntReturner: puntReturners[0],
  };
}

function createOffensiveLineScore(players: readonly PlayerRecord[]): number {
  const linemen = getGroupPlayers(players, OFFENSIVE_LINE_POSITIONS, "offensive line");
  return average(linemen.map((player) => getPlayerRating(player, "rating")));
}

export function createDefensiveGroups(players: readonly PlayerRecord[]): DefensiveGroupsResult {
  const defensiveLine = getGroupPlayers(players, DEFENSIVE_UNITS.line.positions, "defensive line");
  const linebackers = getGroupPlayers(players, DEFENSIVE_UNITS.linebackers.positions, "linebackers");
  const secondary = getGroupPlayers(players, DEFENSIVE_UNITS.secondary.positions, "secondary");
  const dlGroup = average(defensiveLine.map((player) => getPlayerRating(player, "rating")));
  const lbGroup = average(linebackers.map((player) => getPlayerRating(player, "rating")));
  const secondaryGroup = average(secondary.map((player) => getPlayerRating(player, "rating")));

  return {
    dlGroup,
    lbGroup,
    secondaryGroup,
    score: (
      DEFENSIVE_UNITS.line.weight * dlGroup +
      DEFENSIVE_UNITS.linebackers.weight * lbGroup +
      DEFENSIVE_UNITS.secondary.weight * secondaryGroup
    ) / DEFENSIVE_STARTER_COUNT,
  };
}

// The verifier evaluates these same formulas with exact Z3 reals.
export function calculateTeamOffenseAndOverall<T>(
  inputs: { runningSkill: T; passingSkill: T; balancedSkill: T; line: T; qb: T; returns: T; defense: T },
  blend: (parts: readonly { weight: number; value: T }[]) => T,
) {
  const runningOffenseRating = blend([
    { weight: 0.63, value: inputs.runningSkill },
    { weight: 0.27, value: inputs.line },
    { weight: 0.1, value: inputs.returns },
  ]);
  const passingOffenseRating = blend([
    { weight: 0.45, value: inputs.qb },
    { weight: 0.315, value: inputs.passingSkill },
    { weight: 0.135, value: inputs.line },
    { weight: 0.1, value: inputs.returns },
  ]);
  const balancedOffenseRating = blend([
    { weight: 0.27, value: inputs.qb },
    { weight: 0.18, value: inputs.line },
    { weight: 0.45, value: inputs.balancedSkill },
    { weight: 0.1, value: inputs.returns },
  ]);
  const offensiveRating = blend([
    { weight: 0.25, value: runningOffenseRating },
    { weight: 0.25, value: passingOffenseRating },
    { weight: 0.5, value: balancedOffenseRating },
  ]);
  const overallRating = blend([
    { weight: 0.5, value: offensiveRating },
    { weight: 0.5, value: inputs.defense },
  ]);
  return { runningOffenseRating, passingOffenseRating, balancedOffenseRating, offensiveRating, overallRating };
}

export function buildTeamRatingRecord(teamSlug: TeamSlug, teamData: TeamData, round = roundTo): TeamRatingRecord {
  const { players } = teamData;
  const quarterbackRoom = createQuarterbackRoom(players);
  const quarterbackRoomScore = quarterbackRoom.score;
  const quarterbackRating = getPlayerRating(quarterbackRoom.bestQb, "rating");
  const offensiveSkillLineups = createOffensiveSkillLineups(players);
  const offensiveLineScore = createOffensiveLineScore(players);
  const returnRoom = createReturnRoom(players);
  const returnRoomScore = returnRoom.score;
  const defensiveGroups = createDefensiveGroups(players);
  const defensiveRating = defensiveGroups.score;
  const { runningOffenseRating, passingOffenseRating, balancedOffenseRating, offensiveRating, overallRating } =
    calculateTeamOffenseAndOverall({
      runningSkill: offensiveSkillLineups.runningSkillRating,
      passingSkill: offensiveSkillLineups.passingSkillRating,
      balancedSkill: offensiveSkillLineups.balancedSkillRating,
      line: offensiveLineScore,
      qb: quarterbackRoomScore,
      returns: returnRoomScore,
      defense: defensiveRating,
    }, weightedAverage);

  return {
    team: teamSlug,
    full_name: teamData.full_name,
    offensive_rating: round(offensiveRating),
    defensive_rating: round(defensiveRating),
    overall_rating: round(overallRating),
    components: {
      qb_room: round(quarterbackRoomScore),
      qb_rating: round(quarterbackRating),
      return_room: round(returnRoomScore),
      ol_line: round(offensiveLineScore),
      running_skill: round(offensiveSkillLineups.runningSkillRating),
      passing_skill: round(offensiveSkillLineups.passingSkillRating),
      balanced_skill: round(offensiveSkillLineups.balancedSkillRating),
      running_offense: round(runningOffenseRating),
      passing_offense: round(passingOffenseRating),
      balanced_offense: round(balancedOffenseRating),
      dl_group: round(defensiveGroups.dlGroup),
      lb_group: round(defensiveGroups.lbGroup),
      secondary_group: round(defensiveGroups.secondaryGroup),
    },
    selected_lineups: {
      best_qb: getPlayerLabel(quarterbackRoom.bestQb),
      backup_qb: getPlayerLabel(quarterbackRoom.backupQb),
      running_lineup: formatOffensiveSkillLineup(offensiveSkillLineups.runningAssignment),
      passing_lineup: formatOffensiveSkillLineup(offensiveSkillLineups.passingAssignment),
      balanced_lineup: formatOffensiveSkillLineup(offensiveSkillLineups.balancedAssignment),
      kr: getPlayerLabel(returnRoom.kickReturner),
      pr: getPlayerLabel(returnRoom.puntReturner),
    },
  };
}
