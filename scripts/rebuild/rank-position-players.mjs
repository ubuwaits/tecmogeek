import { comparePlayerRanks } from "./compare-player-ranks.mjs";

// Each category has its own published order. Capture it before replacing ranks.
export function rankPositionPlayers(players, scorePlayer, ratingKey, rankingKey) {
  const candidates = players.map(player => ({
    player,
    rating: scorePlayer(player),
    hittingPower: Number(player.hitting_power ?? 0),
    previousRank: player[rankingKey] ?? Number.MAX_SAFE_INTEGER,
  }));
  candidates.sort(comparePlayerRanks).forEach(({ player, rating }, index) => {
    player[ratingKey] = `${rating}%`;
    player[rankingKey] = index + 1;
  });
}
