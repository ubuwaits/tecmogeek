import type { PlayerRecord, PositionPageConfig, PositionSlug } from "../types.ts";

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
