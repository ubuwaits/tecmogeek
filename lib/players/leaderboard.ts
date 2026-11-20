import { POSITION_SLUGS, type PlayerRecord, type PositionPageConfig, type PositionSlug } from "../types.ts";
import { eligibleForPosition } from "./positions.mts";

export function positionEntries<T extends PlayerRecord>(players: readonly T[], { slug, rankingKey }: PositionPageConfig) {
  return players.filter(player => eligibleForPosition(player, slug))
    .sort((a, b) => Number(a[rankingKey]) - Number(b[rankingKey]));
}

export function leaderboardCounts(players: readonly PlayerRecord[]): Record<PositionSlug, number> {
  const counts = {} as Record<PositionSlug, number>;
  for (const slug of POSITION_SLUGS) {
    counts[slug] = players.reduce((total, player) => total + Number(eligibleForPosition(player, slug)), 0);
  }
  return counts;
}
