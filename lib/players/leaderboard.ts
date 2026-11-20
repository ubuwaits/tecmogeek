import { POSITION_SLUGS, type PlayerRecord, type PositionPageConfig, type PositionSlug } from "../types.ts";

const skillPositions = /^(RB|WR|TE)\d+$/;
const eligiblePositions: Record<PositionSlug, RegExp> = {
  qb: /^QB\d+$/,
  rushers: skillPositions,
  receivers: skillPositions,
  "kick-returners": skillPositions,
  "punt-returners": skillPositions,
  ol: /^(C|LG|RG|LT|RT)$/,
  dl: /^(RE|NT|LE)$/,
  lb: /^(ROLB|RILB|LILB|LOLB)$/,
  "cb-s": /^(RCB|LCB|FS|SS)$/,
  k: /^K$/,
  p: /^P$/,
};

export function positionEntries(players: readonly PlayerRecord[], { slug, rankingKey }: PositionPageConfig) {
  return players.filter(player => eligiblePositions[slug].test(player.position))
    .sort((a, b) => Number(a[rankingKey]) - Number(b[rankingKey]));
}

export function leaderboardCounts(players: readonly PlayerRecord[]): Record<PositionSlug, number> {
  const counts = {} as Record<PositionSlug, number>;
  for (const slug of POSITION_SLUGS) {
    const eligible = eligiblePositions[slug];
    counts[slug] = players.reduce((total, player) => total + Number(eligible.test(player.position)), 0);
  }
  return counts;
}
