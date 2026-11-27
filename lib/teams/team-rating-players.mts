import { parsePercent } from "../players/rating.mts";
import type { PlayerRatingKey } from "../types.ts";

const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];

export type PlayerRecord = {
  position: string;
  name: string;
  number: string;
  [key: string]: string | number | undefined;
};

export function getPlayerLabel(player: PlayerRecord): string {
  return `${player.name} (${player.position})`;
}

export function getPlayerRating(player: PlayerRecord, key: PlayerRatingKey): number {
  return parsePercent(player[key]);
}

export function isSkillPlayer(player: PlayerRecord): boolean {
  return SKILL_POSITION_PREFIXES.some((prefix) => player.position.startsWith(prefix));
}

export function compareRating(key: PlayerRatingKey) {
  return (left: PlayerRecord, right: PlayerRecord) => getPlayerRating(right, key) - getPlayerRating(left, key);
}
