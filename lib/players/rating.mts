import type { MetricColumn, PlayerMetricKey, PlayerRecord } from "../types.ts";

export function parsePercent(value: string | number | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number.parseFloat(value.replace("%", "")) || 0;
}

type Scores = Partial<Record<number, number>>;
type Maxima = Partial<Record<PlayerMetricKey, number>>;

export function attributeMaxima(players: readonly PlayerRecord[], columns: readonly MetricColumn[]): Maxima {
  const maxima: Maxima = {};
  for (const { key } of columns) {
    if (key !== "hitting_power") maxima[key] = Math.max(...players.map(player => Number(player[key] ?? 0)));
  }
  return maxima;
}

export function attributeScore(player: PlayerRecord, key: PlayerMetricKey, maxima: Maxima, hittingPowerScores: Scores) {
  const value = Number(player[key] ?? 0);
  if (key === "hitting_power") return hittingPowerScores[value] ?? 0;
  const maximum = maxima[key] ?? 0;
  return maximum === 0 ? 0 : (value / maximum) * 100;
}

export function weightedScore(player: PlayerRecord, columns: readonly MetricColumn[], maxima: Maxima, hittingPowerScores: Scores) {
  return columns.reduce((total, { key, weight }) =>
    total + weight * (attributeScore(player, key, maxima, hittingPowerScores) / 100), 0);
}

export function weightedRating(player: PlayerRecord, columns: readonly MetricColumn[], maxima: Maxima, hittingPowerScores: Scores) {
  return Math.round(weightedScore(player, columns, maxima, hittingPowerScores));
}
