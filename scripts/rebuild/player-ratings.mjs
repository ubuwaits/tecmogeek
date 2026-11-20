import { POSITION_PAGE_CONFIG_MAP } from "../../lib/players/config.ts";
import { eligibleForPosition } from "../../lib/players/positions.mts";
import { DEFENSIVE_HP_SCORE_MAP, OFFENSIVE_HP_SCORE_MAP, OFFENSIVE_LINE_HP_SCORE_MAP } from "../../lib/players/metrics.ts";
import { applyReturnSpeeds } from "../../lib/players/return-speeds.mts";
import { attributeMaxima, weightedRating } from "./player-rating.mjs";
import { rankPositionPlayers } from "./rank-position-players.mjs";

const offense = {
  rushers: OFFENSIVE_HP_SCORE_MAP,
  receivers: OFFENSIVE_HP_SCORE_MAP,
  "kick-returners": OFFENSIVE_HP_SCORE_MAP,
  "punt-returners": OFFENSIVE_HP_SCORE_MAP,
  ol: OFFENSIVE_LINE_HP_SCORE_MAP,
};
const defense = {
  dl: DEFENSIVE_HP_SCORE_MAP,
  lb: DEFENSIVE_HP_SCORE_MAP,
  "cb-s": DEFENSIVE_HP_SCORE_MAP,
};
export const rebuildScales = { ...offense, ...defense };
const categories = { offense, defense, all: rebuildScales };

export function rebuildPlayerRatings(teams, scope) {
  if (!Object.hasOwn(categories, scope)) throw new Error("Expected rebuild scope: offense, defense or all.");
  if (scope !== "defense") teams.forEach(applyReturnSpeeds);
  const roster = teams.flatMap(team => team.players);
  for (const [slug, scale] of Object.entries(categories[scope])) {
    const { columns, ratingKey, rankingKey } = POSITION_PAGE_CONFIG_MAP[slug];
    const players = roster.filter(player => eligibleForPosition(player, slug));
    const maxima = attributeMaxima(players, columns);
    rankPositionPlayers(players, player => weightedRating(player, columns, maxima, scale), ratingKey, rankingKey);
  }
}
