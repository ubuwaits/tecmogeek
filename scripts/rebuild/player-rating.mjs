export function getNumericValue(player, key) {
  return Number(player[key] ?? 0);
}

export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export function attributeMaxima(players, columns, normalizeHittingPower) {
  const maxima = {};
  for (const { key } of columns) {
    if (key === "hitting_power" && !normalizeHittingPower) continue;
    maxima[key] = Math.max(...players.map(player => getNumericValue(player, key)));
  }
  return maxima;
}

export function weightedRating(player, columns, maxima, hittingPowerScores) {
  let total = 0;
  for (const { key, weight } of columns) {
    const value = getNumericValue(player, key);
    let score;
    if (key === "hitting_power" && hittingPowerScores) {
      score = hittingPowerScores[value] ?? 0;
    } else {
      const maximum = maxima[key] ?? 0;
      score = maximum === 0 ? 0 : (value / maximum) * 100;
    }
    total += weight * (score / 100);
  }
  return Math.round(total);
}
