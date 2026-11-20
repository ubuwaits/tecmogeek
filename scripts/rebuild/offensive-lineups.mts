import type { OffensiveSkillLineupRecord } from "../../lib/types.ts";
import {
  getPlayerLabel, getPlayerRating, isSkillPlayer, sortPlayersByRating,
  type PlayerRecord, type RatedPlayer,
} from "./team-rating-players.mts";

const OFFENSIVE_SKILL_SLOTS = ["RB1", "RB2", "WR1", "WR2", "TE1"] as const;

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

type OffensiveSkillSlot = (typeof OFFENSIVE_SKILL_SLOTS)[number];

type SkillSlotAssignment = Record<OffensiveSkillSlot, RatedPlayer>;

type OffensiveSkillLineupsResult = {
  runningSkillRating: number;
  passingSkillRating: number;
  balancedSkillRating: number;
  runningAssignment: SkillSlotAssignment;
  passingAssignment: SkillSlotAssignment;
  balancedAssignment: SkillSlotAssignment;
};

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

export function formatOffensiveSkillLineup(assignment: SkillSlotAssignment): OffensiveSkillLineupRecord {
  return Object.fromEntries(
    OFFENSIVE_SKILL_SLOTS.map((slot) => [slot, getPlayerLabel(assignment[slot])]),
  ) as OffensiveSkillLineupRecord;
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
  const [TE1] = sortPlayersByRunningTeSupport(players);
  const rushers = players.filter(player => player !== TE1);
  const [RB1, RB2, WR1, WR2] = sortPlayersByRating(rushers, "rushing_rating");
  return { RB1, RB2, WR1, WR2, TE1 };
}

function assignPassingLineup(players: readonly RatedPlayer[]): SkillSlotAssignment {
  const [WR1, WR2, TE1, ...runningBacks] = sortPlayersByRating(players, "receiving_rating");
  const [RB1, RB2] = sortPlayersByRating(runningBacks, "rushing_rating");
  return { RB1, RB2, WR1, WR2, TE1 };
}

export function compareLineupScores(candidate: number, incumbent: number) {
  if (candidate > incumbent + FLOAT_TOLERANCE) return 1;
  if (Math.abs(candidate - incumbent) <= FLOAT_TOLERANCE) return 0;
  return -1;
}

type LineupObserver = (candidate: SkillSlotAssignment, best: SkillSlotAssignment | null, bestScore: number) => void;

function chooseBestAssignment(
  skillPlayers: readonly RatedPlayer[],
  buildAssignment: (players: readonly RatedPlayer[]) => SkillSlotAssignment,
  scoreAssignment: (assignment: SkillSlotAssignment) => number,
  observe?: LineupObserver,
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
    } else if (
      comparison === 0 &&
      bestAssignment &&
      getAssignmentSignature(assignment) < getAssignmentSignature(bestAssignment)
    ) {
      bestAssignment = assignment;
    }
    observe?.(assignment, bestAssignment, bestScore);
  }

  if (!bestAssignment) {
    throw new Error("Unable to determine the best skill assignment.");
  }

  return {
    assignment: bestAssignment,
    score: bestScore,
  };
}

export function createOffensiveSkillLineups(
  players: readonly PlayerRecord[],
  observers?: Partial<Record<"running" | "passing" | "balanced", LineupObserver>>,
): OffensiveSkillLineupsResult {
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
  const running = chooseBestAssignment(skillPlayers, assignRunningLineup, score("running"), observers?.running);
  const passing = chooseBestAssignment(skillPlayers, assignPassingLineup, score("passing"), observers?.passing);
  const balanced = chooseBestAssignment(skillPlayers, assignPassingLineup, score("balanced"), observers?.balanced);

  return {
    runningSkillRating: running.score,
    passingSkillRating: passing.score,
    balancedSkillRating: balanced.score,
    runningAssignment: running.assignment,
    passingAssignment: passing.assignment,
    balancedAssignment: balanced.assignment,
  };
}
