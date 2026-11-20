import { comparePlayerRanks } from "./compare-player-ranks.mjs";
import { formatPercent, getNumericValue } from "./player-rating.mjs";
import { getPlayerKey } from "./roster-files.mts";

export function rankPositionPlayers(sourceRows, scorePlayer) {
  const candidates = sourceRows.map((player, sourceIndex) => ({
    player,
    sourceIndex,
    rating: scorePlayer(player),
    hittingPower: getNumericValue(player, "hitting_power"),
  }));

  const updates = new Map();
  const rebuiltRows = candidates.sort(comparePlayerRanks).map(({ player, rating }, index) => {
    const update = { rating: formatPercent(rating), ranking: index + 1 };
    updates.set(getPlayerKey(player), update);
    return { ...player, ...update };
  });

  return { rebuiltRows, updates };
}
