// A full tie retains the player's previous rank in this category.
export function comparePlayerRanks(left, right) {
  return right.rating - left.rating ||
    right.hittingPower - left.hittingPower ||
    left.previousRank - right.previousRank;
}
