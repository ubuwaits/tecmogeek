// Independent hitting-power ladders from the site's player-rating explanation.
export const skillHP = { 75: 5, 81: 25, 88: 60, 94: 100 };
export const lineHP = { 31: 0, 38: 15, 44: 30, 50: 45, 56: 55, 63: 65, 69: 80, 75: 90, 81: 100 };
export const defenseHP = { 19: 0, 25: 7, 31: 16, 38: 23, 44: 30, 50: 36, 56: 45, 63: 59, 69: 78, 75: 100 };
export const expectedScales = {
  rushers: skillHP, receivers: skillHP, "kick-returners": skillHP, "punt-returners": skillHP,
  ol: lineHP, dl: defenseHP, lb: defenseHP, "cb-s": defenseHP,
};

// Independent published weights for each leaderboard.
export const expectedWeights = {
  qb: { maximum_speed: 25, passing_speed: 20, pass_control: 50, avoid_pass_block: 5 },
  rushers: { running_speed: 10, maximum_speed: 70, hitting_power: 10, ball_control: 5, receptions: 5 },
  receivers: { running_speed: 10, maximum_speed: 45, hitting_power: 5, ball_control: 5, receptions: 35 },
  "kick-returners": { running_speed: 20, kick_return_maximum_speed: 60, hitting_power: 10, ball_control: 10 },
  "punt-returners": { running_speed: 20, punt_return_maximum_speed: 70, hitting_power: 10 },
  ol: { maximum_speed: 20, hitting_power: 80 },
  dl: { running_speed: 10, rushing_power: 35, maximum_speed: 10, hitting_power: 40, pass_interceptions: 5 },
  lb: { running_speed: 10, rushing_power: 35, maximum_speed: 10, hitting_power: 30, pass_interceptions: 15 },
  "cb-s": { running_speed: 10, rushing_power: 35, maximum_speed: 10, hitting_power: 5, pass_interceptions: 40 },
  k: { kicking_ability: 100 },
  p: { kicking_ability: 100 },
};

export function exactPlayerRating(player, slug, maxima) {
  let numerator = 0n;
  let denominator = 1n;
  for (const [field, weight] of Object.entries(expectedWeights[slug])) {
    const maximum = BigInt(field === "hitting_power" ? 100 : maxima[field]);
    if (maximum === 0n) continue;
    const points = field === "hitting_power" ? (expectedScales[slug][player[field]] ?? 0) : player[field];
    // Add weight * points / maximum using a common denominator.
    numerator = numerator * maximum + BigInt(weight) * BigInt(points) * denominator;
    denominator *= maximum;
  }
  // Round the complete nonnegative fraction half up.
  return Number((2n * numerator + denominator) / (2n * denominator));
}
