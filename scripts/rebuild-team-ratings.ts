import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const TEAM_RATINGS_FILE_NAME = "team-ratings.json";
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
  TEAM_RATINGS_FILE_NAME,
]);

const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];
const OFFENSIVE_SKILL_SLOTS = ["RB1", "RB2", "WR1", "WR2", "TE1"] as const;
const OFFENSIVE_LINE_POSITIONS = ["C", "LG", "RG", "LT", "RT"];
export const DEFENSIVE_UNITS = {
  line: { positions: ["RE", "NT", "LE"], weight: 3 },
  linebackers: { positions: ["ROLB", "RILB", "LILB", "LOLB"], weight: 4 },
  secondary: { positions: ["RCB", "LCB", "FS", "SS"], weight: 4 },
} as const;
export const DEFENSIVE_STARTER_COUNT = 11;
const RUN_SLOT_WEIGHTS: Record<OffensiveSkillSlot, number> = {
  RB1: 0.4,
  RB2: 0.3,
  WR1: 0.12,
  WR2: 0.1,
  TE1: 0.08,
};
const PASS_SLOT_WEIGHTS: Record<OffensiveSkillSlot, number> = {
  RB1: 0.1,
  RB2: 0.15,
  WR1: 0.3,
  WR2: 0.25,
  TE1: 0.2,
};
const BALANCED_SKILL_WEIGHTS = {
  running: 0.25,
  passing: 0.75,
} as const;
export const FLOAT_TOLERANCE = 1e-9;

type RatingKey =
  | "rating"
  | "rushing_rating"
  | "receiving_rating"
  | "kick_return_rating"
  | "punt_return_rating";

type PlayerRecord = {
  team: string;
  position: string;
  name: string;
  number: string;
  rating?: string | number;
  rushing_rating?: string | number;
  receiving_rating?: string | number;
  kick_return_rating?: string | number;
  punt_return_rating?: string | number;
  [key: string]: string | number | undefined;
};

type TeamData = {
  full_name: string;
  short_name: string;
  players: PlayerRecord[];
};

export type OffensiveSkillSlot = (typeof OFFENSIVE_SKILL_SLOTS)[number];

type RatedPlayer = PlayerRecord & {
  rosterIndex: number;
};

type SkillSlotAssignment = Record<OffensiveSkillSlot, RatedPlayer>;

export type TeamRatingComponents = {
  qb_room: number;
  qb_rating: number;
  return_room: number;
  ol_line: number;
  running_skill: number;
  passing_skill: number;
  balanced_skill: number;
  running_offense: number;
  passing_offense: number;
  balanced_offense: number;
  dl_group: number;
  lb_group: number;
  secondary_group: number;
};

export type OffensiveSkillLineup = Record<OffensiveSkillSlot, string>;

export type TeamRatingSelectedLineups = {
  best_qb: string;
  backup_qb: string;
  running_lineup: OffensiveSkillLineup;
  passing_lineup: OffensiveSkillLineup;
  balanced_lineup: OffensiveSkillLineup;
  kr: string;
  pr: string;
};

export type TeamRatingRecord = {
  team: string;
  full_name: string;
  offensive_rating: number;
  defensive_rating: number;
  overall_rating: number;
  components: TeamRatingComponents;
  selected_lineups: TeamRatingSelectedLineups;
};

export type QuarterbackRoomResult = {
  score: number;
  bestQb: RatedPlayer;
  backupQb: RatedPlayer;
};

export type ReturnRoomResult = {
  score: number;
  kickReturnScore: number;
  puntReturnScore: number;
  kickReturner: RatedPlayer;
  puntReturner: RatedPlayer;
};

export type OffensiveSkillLineupsResult = {
  runningSkillRating: number;
  passingSkillRating: number;
  balancedSkillRating: number;
  runningAssignment: SkillSlotAssignment;
  passingAssignment: SkillSlotAssignment;
  balancedAssignment: SkillSlotAssignment;
};

export type DefensiveGroupsResult = {
  dlGroup: number;
  lbGroup: number;
  secondaryGroup: number;
  score: number;
};

function readJson<T>(fileName: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8")) as T;
}

function writeJson(fileName: string, value: unknown) {
  fs.writeFileSync(path.join(DATA_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function parsePercent(value: string | number | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number.parseFloat(value.replace("%", "")) || 0;
}

function roundTo(value: number, decimals = 3): number {
  return Number(value.toFixed(decimals));
}

function weightedAverage(parts: readonly { weight: number; value: number }[]): number {
  return parts.reduce((total, part) => total + part.weight * part.value, 0);
}

function average(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getPlayerLabel(player: PlayerRecord): string {
  return `${player.name} (${player.position})`;
}

function getPlayerRating(player: PlayerRecord, key: RatingKey): number {
  return parsePercent(player[key]);
}

function getNumericField(player: PlayerRecord, key: string): number {
  const value = player[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseFloat(value) || 0;
  }

  return 0;
}

function getHittingPower(player: PlayerRecord): number {
  return getNumericField(player, "hitting_power");
}

function isSkillPlayer(player: PlayerRecord): boolean {
  return SKILL_POSITION_PREFIXES.some((prefix) => player.position.startsWith(prefix));
}

function sortPlayersByRating(players: readonly RatedPlayer[], key: RatingKey): RatedPlayer[] {
  return [...players].sort((left, right) => {
    const rightRating = getPlayerRating(right, key);
    const leftRating = getPlayerRating(left, key);

    if (rightRating !== leftRating) {
      return rightRating - leftRating;
    }

    return left.rosterIndex - right.rosterIndex;
  });
}

function getCombinations<T>(values: readonly T[], size: number): T[][] {
  if (size === 0) {
    return [[]];
  }

  if (size > values.length) {
    return [];
  }

  const combinations: T[][] = [];

  for (let index = 0; index <= values.length - size; index += 1) {
    const head = values[index];
    const tails = getCombinations(values.slice(index + 1), size - 1);

    for (const tail of tails) {
      combinations.push([head, ...tail]);
    }
  }

  return combinations;
}

function getGroupPlayers(players: readonly RatedPlayer[], positions: readonly string[], groupName: string) {
  const groupPlayers = players.filter((player) => positions.includes(player.position));
  for (const position of positions) {
    const count = groupPlayers.filter((player) => player.position === position).length;
    if (count !== 1) {
      throw new Error(`Expected exactly one ${position} in ${groupName}, received ${count}.`);
    }
  }
  return groupPlayers;
}

function formatOffensiveSkillLineup(assignment: SkillSlotAssignment): OffensiveSkillLineup {
  return Object.fromEntries(
    OFFENSIVE_SKILL_SLOTS.map((slot) => [slot, getPlayerLabel(assignment[slot])]),
  ) as OffensiveSkillLineup;
}

function getAssignmentSignature(assignment: SkillSlotAssignment): string {
  return OFFENSIVE_SKILL_SLOTS.map((slot) => `${slot}:${assignment[slot].name}`).join("|");
}

type LineupArithmetic<T> = {
  add: (a: T, b: T) => T;
  multiply: (value: T, weight: number) => T;
  constant: (value: number) => T;
};

const numericArithmetic: LineupArithmetic<number> = {
  add: (a, b) => a + b,
  multiply: (value, weight) => value * weight,
  constant: value => value,
};

function runningSupport<T>(receiving: T, highPower: boolean, ops: LineupArithmetic<T>): T {
  return highPower ? ops.add(ops.constant(95), ops.multiply(receiving, 0.05)) : receiving;
}

export function hasHighRunningPower(hittingPower: number) {
  return hittingPower >= 75;
}

function getRunningTeSupportScore(player: PlayerRecord): number {
  return runningSupport(getPlayerRating(player, "receiving_rating"), hasHighRunningPower(getHittingPower(player)), numericArithmetic);
}

// The precision proof evaluates this same expression with bounded binary64 operation errors.
export function lineupScore<T>(
  mode: "running" | "passing" | "balanced",
  rush: (slot: OffensiveSkillSlot) => T, receive: (slot: OffensiveSkillSlot) => T,
  highPowerTE: boolean, ops: LineupArithmetic<T>,
): T {
  function running() {
    return OFFENSIVE_SKILL_SLOTS.reduce((sum, slot) => {
      const value = slot === "TE1" ? runningSupport(receive(slot), highPowerTE, ops) : rush(slot);
      return ops.add(sum, ops.multiply(value, RUN_SLOT_WEIGHTS[slot]));
    }, ops.constant(0));
  }
  function passing() {
    return OFFENSIVE_SKILL_SLOTS.reduce((sum, slot) =>
      ops.add(sum, ops.multiply(receive(slot), PASS_SLOT_WEIGHTS[slot])), ops.constant(0));
  }
  if (mode === "running") return running();
  if (mode === "passing") return passing();
  return ops.add(ops.multiply(running(), BALANCED_SKILL_WEIGHTS.running),
    ops.multiply(passing(), BALANCED_SKILL_WEIGHTS.passing));
}

function createLineupAssignment(
  rbPlayers: readonly RatedPlayer[],
  receivingPlayers: readonly RatedPlayer[],
): SkillSlotAssignment {
  const orderedRbs = sortPlayersByRating(rbPlayers, "rushing_rating");
  const orderedReceivers = sortPlayersByRating(receivingPlayers, "receiving_rating");

  return {
    RB1: orderedRbs[0],
    RB2: orderedRbs[1],
    WR1: orderedReceivers[0],
    WR2: orderedReceivers[1],
    TE1: orderedReceivers[2],
  };
}

function createRunningLineupAssignment(
  rbPlayers: readonly RatedPlayer[],
  wrPlayers: readonly RatedPlayer[],
  tePlayer: RatedPlayer,
): SkillSlotAssignment {
  const orderedRbs = sortPlayersByRating(rbPlayers, "rushing_rating");
  const orderedWrs = sortPlayersByRating(wrPlayers, "rushing_rating");

  return {
    RB1: orderedRbs[0],
    RB2: orderedRbs[1],
    WR1: orderedWrs[0],
    WR2: orderedWrs[1],
    TE1: tePlayer,
  };
}

function sortPlayersByRunningTeSupport(players: readonly RatedPlayer[]): RatedPlayer[] {
  return [...players].sort((left, right) => {
    const rightHasHighHp = hasHighRunningPower(getHittingPower(right));
    const leftHasHighHp = hasHighRunningPower(getHittingPower(left));

    if (rightHasHighHp !== leftHasHighHp) {
      return Number(rightHasHighHp) - Number(leftHasHighHp);
    }

    const rightSupport = getRunningTeSupportScore(right);
    const leftSupport = getRunningTeSupportScore(left);

    if (rightSupport !== leftSupport) {
      return rightSupport - leftSupport;
    }

    const rightHp = getHittingPower(right);
    const leftHp = getHittingPower(left);

    if (rightHp !== leftHp) {
      return rightHp - leftHp;
    }

    const rightReceiving = getPlayerRating(right, "receiving_rating");
    const leftReceiving = getPlayerRating(left, "receiving_rating");

    if (rightReceiving !== leftReceiving) {
      return rightReceiving - leftReceiving;
    }

    return left.rosterIndex - right.rosterIndex;
  });
}

function assignRunningLineup(players: readonly RatedPlayer[]): SkillSlotAssignment {
  const tePlayer = sortPlayersByRunningTeSupport(players)[0];
  const teIndex = tePlayer.rosterIndex;
  const nonTePlayers = players.filter((player) => player.rosterIndex !== teIndex);
  const rushers = sortPlayersByRating(nonTePlayers, "rushing_rating");
  const rbPlayers = rushers.slice(0, 2);
  const rbIndexes = new Set(rbPlayers.map((player) => player.rosterIndex));
  const wrPlayers = nonTePlayers.filter((player) => !rbIndexes.has(player.rosterIndex));

  return createRunningLineupAssignment(rbPlayers, wrPlayers, tePlayer);
}

function assignPassingLineup(players: readonly RatedPlayer[]): SkillSlotAssignment {
  const receivers = sortPlayersByRating(players, "receiving_rating");
  const receivingPlayers = receivers.slice(0, 3);
  const receiverIndexes = new Set(receivingPlayers.map((player) => player.rosterIndex));
  const rbPlayers = players.filter((player) => !receiverIndexes.has(player.rosterIndex));

  return createLineupAssignment(rbPlayers, receivingPlayers);
}

function assignBalancedLineup(players: readonly RatedPlayer[]): SkillSlotAssignment {
  return assignPassingLineup(players);
}

export function compareLineupScores(candidate: number, incumbent: number) {
  if (candidate > incumbent + FLOAT_TOLERANCE) return 1;
  if (Math.abs(candidate - incumbent) <= FLOAT_TOLERANCE) return 0;
  return -1;
}

function chooseBestAssignment(
  skillPlayers: readonly RatedPlayer[],
  buildAssignment: (players: readonly RatedPlayer[]) => SkillSlotAssignment,
  scoreAssignment: (assignment: SkillSlotAssignment) => number,
): { assignment: SkillSlotAssignment; score: number } {
  let bestAssignment: SkillSlotAssignment | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const lineupPlayers of getCombinations(skillPlayers, OFFENSIVE_SKILL_SLOTS.length)) {
    const assignment = buildAssignment(lineupPlayers);
    const score = scoreAssignment(assignment);

    const comparison = compareLineupScores(score, bestScore);
    if (comparison > 0) {
      bestScore = score;
      bestAssignment = assignment;
      continue;
    }

    if (
      comparison === 0 &&
      bestAssignment &&
      getAssignmentSignature(assignment) < getAssignmentSignature(bestAssignment)
    ) {
      bestAssignment = assignment;
    }
  }

  if (!bestAssignment) {
    throw new Error("Unable to determine the best skill assignment.");
  }

  return {
    assignment: bestAssignment,
    score: bestScore,
  };
}

export function createQuarterbackRoom(players: readonly PlayerRecord[]): QuarterbackRoomResult {
  const quarterbacks = players
    .filter((player) => player.position.startsWith("QB"))
    .map((player, rosterIndex) => ({ ...player, rosterIndex }));

  if (quarterbacks.length !== 2) {
    throw new Error(`Expected 2 quarterbacks, received ${quarterbacks.length}.`);
  }

  const [bestQb, backupQb] = sortPlayersByRating(quarterbacks, "rating");

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
  const skillPlayers = players
    .filter(isSkillPlayer)
    .map((player, rosterIndex) => ({ ...player, rosterIndex }));

  if (skillPlayers.length < 2) {
    throw new Error(`Expected at least 2 skill players, received ${skillPlayers.length}.`);
  }

  const kickReturners = sortPlayersByRating(skillPlayers, "kick_return_rating");
  const puntReturners = sortPlayersByRating(skillPlayers, "punt_return_rating");
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

export function createOffensiveSkillLineups(players: readonly PlayerRecord[]): OffensiveSkillLineupsResult {
  const skillPlayers = players
    .filter(isSkillPlayer)
    .map((player, rosterIndex) => ({ ...player, rosterIndex }));

  if (skillPlayers.length !== 10) {
    throw new Error(`Expected 10 skill players, received ${skillPlayers.length}.`);
  }

  const score = (mode: "running" | "passing" | "balanced") => (assignment: SkillSlotAssignment) =>
    lineupScore(mode, slot => getPlayerRating(assignment[slot], "rushing_rating"),
      slot => getPlayerRating(assignment[slot], "receiving_rating"), hasHighRunningPower(getHittingPower(assignment.TE1)),
      numericArithmetic);
  const running = chooseBestAssignment(skillPlayers, assignRunningLineup, score("running"));
  const passing = chooseBestAssignment(skillPlayers, assignPassingLineup, score("passing"));
  const balanced = chooseBestAssignment(skillPlayers, assignBalancedLineup, score("balanced"));

  return {
    runningSkillRating: running.score,
    passingSkillRating: passing.score,
    balancedSkillRating: balanced.score,
    runningAssignment: running.assignment,
    passingAssignment: passing.assignment,
    balancedAssignment: balanced.assignment,
  };
}

function createOffensiveLineScore(players: readonly RatedPlayer[]): number {
  const linemen = getGroupPlayers(players, OFFENSIVE_LINE_POSITIONS, "offensive line");
  return average(linemen.map((player) => getPlayerRating(player, "rating")));
}

export function createDefensiveGroups(players: readonly PlayerRecord[]): DefensiveGroupsResult {
  const ratedPlayers = players.map((player, rosterIndex) => ({ ...player, rosterIndex }));
  const defensiveLine = getGroupPlayers(ratedPlayers, DEFENSIVE_UNITS.line.positions, "defensive line");
  const linebackers = getGroupPlayers(ratedPlayers, DEFENSIVE_UNITS.linebackers.positions, "linebackers");
  const secondary = getGroupPlayers(ratedPlayers, DEFENSIVE_UNITS.secondary.positions, "secondary");
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

export function buildTeamRatingRecord(teamSlug: string, teamData: TeamData, round = roundTo): TeamRatingRecord {
  const players = teamData.players.map((player, rosterIndex) => ({ ...player, rosterIndex }));
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

export function getTeamFileNames(): string[] {
  return fs
    .readdirSync(DATA_DIR)
    .filter((fileName) => fileName.endsWith(".json") && !AGGREGATE_FILE_NAMES.has(fileName))
    .sort();
}

export function buildTeamRatings(): TeamRatingRecord[] {
  return getTeamFileNames().map((fileName) => {
    const teamSlug = fileName.replace(/\.json$/u, "");
    return buildTeamRatingRecord(teamSlug, readJson<TeamData>(fileName));
  });
}

export function writeTeamRatingsFile(records: readonly TeamRatingRecord[]) {
  writeJson(TEAM_RATINGS_FILE_NAME, records);
}

export function rebuildTeamRatings() {
  const records = buildTeamRatings();
  writeTeamRatingsFile(records);
  return records;
}

function isDirectExecution() {
  return process.argv[1] ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false;
}

if (isDirectExecution()) {
  const records = rebuildTeamRatings();
  console.log(`Wrote ${records.length} team ratings to ${path.join("data", TEAM_RATINGS_FILE_NAME)}.`);
}
