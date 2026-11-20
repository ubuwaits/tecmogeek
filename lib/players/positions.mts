import type { PlayerRecord, PositionSlug } from "../types.ts";

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

export function eligibleForPosition(player: PlayerRecord, slug: PositionSlug) {
  return eligiblePositions[slug].test(player.position);
}
