import { comparePlayerRanks } from "./compare-player-ranks.mjs";
import { formatPercent, getNumericValue } from "./player-rating.mjs";

// Each category has its own published order. Capture it before replacing ranks.
export function rankPositionPlayers(players, scorePlayer, ratingKey, rankingKey) {
  const candidates = players.map(player => ({
    player,
    rating: scorePlayer(player),
    hittingPower: getNumericValue(player, "hitting_power"),
    previousRank: player[rankingKey] ?? Number.MAX_SAFE_INTEGER,
  }));
  candidates.sort(comparePlayerRanks).forEach(({ player, rating }, index) => {
    player[ratingKey] = formatPercent(rating);
    player[rankingKey] = index + 1;
  });
}
