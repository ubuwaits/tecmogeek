// A full tie retains the player's order in this position's input file.
export function comparePlayerRanks(left, right) {
  return right.rating - left.rating ||
    right.hittingPower - left.hittingPower ||
    left.sourceIndex - right.sourceIndex;
}
