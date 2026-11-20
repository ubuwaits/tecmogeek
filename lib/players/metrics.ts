import type { MetricColumn } from "@/lib/types";

const maximumSpeedLabel = { label: "MS", tooltip: "Maximum Speed" };

const METRIC_LABELS = {
  maximum_speed: maximumSpeedLabel,
  passing_speed: { label: "PS", tooltip: "Passing Speed" },
  pass_control: { label: "PC", tooltip: "Pass Control" },
  avoid_pass_block: { label: "APB", tooltip: "Avoid Pass Block" },
  running_speed: { label: "RS", tooltip: "Running Speed" },
  hitting_power: { label: "HP", tooltip: "Hitting Power" },
  ball_control: { label: "BC", tooltip: "Ball Control" },
  receptions: { label: "REC", tooltip: "Receptions" },
  kick_return_maximum_speed: maximumSpeedLabel,
  punt_return_maximum_speed: maximumSpeedLabel,
  rushing_power: { label: "RP", tooltip: "Rushing Power" },
  pass_interceptions: { label: "PI", tooltip: "Pass Interceptions" },
  kicking_ability: { label: "KA", tooltip: "Kicking Ability" },
} satisfies Partial<Record<MetricColumn["key"], Pick<MetricColumn, "label" | "tooltip">>>;

function metricColumn(key: keyof typeof METRIC_LABELS, weight: number): MetricColumn {
  return { key, ...METRIC_LABELS[key], weight };
}

export const QB_COLUMNS: readonly MetricColumn[] = [
  metricColumn("maximum_speed", 25),
  metricColumn("passing_speed", 20),
  metricColumn("pass_control", 50),
  metricColumn("avoid_pass_block", 5),
];

export const RUSHING_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 10),
  metricColumn("maximum_speed", 70),
  metricColumn("hitting_power", 10),
  metricColumn("ball_control", 5),
  metricColumn("receptions", 5),
];

export const RECEIVING_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 10),
  metricColumn("maximum_speed", 45),
  metricColumn("hitting_power", 5),
  metricColumn("ball_control", 5),
  metricColumn("receptions", 35),
];

export const KICK_RETURN_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 20),
  metricColumn("kick_return_maximum_speed", 60),
  metricColumn("hitting_power", 10),
  metricColumn("ball_control", 10),
];

export const PUNT_RETURN_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 20),
  metricColumn("punt_return_maximum_speed", 70),
  metricColumn("hitting_power", 10),
];

export const OFFENSIVE_LINE_COLUMNS: readonly MetricColumn[] = [
  metricColumn("maximum_speed", 20),
  metricColumn("hitting_power", 80),
];

export const DEFENSIVE_LINE_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 10),
  metricColumn("rushing_power", 35),
  metricColumn("maximum_speed", 10),
  metricColumn("hitting_power", 40),
  metricColumn("pass_interceptions", 5),
];

export const LINEBACKER_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 10),
  metricColumn("rushing_power", 35),
  metricColumn("maximum_speed", 10),
  metricColumn("hitting_power", 30),
  metricColumn("pass_interceptions", 15),
];

export const SECONDARY_COLUMNS: readonly MetricColumn[] = [
  metricColumn("running_speed", 10),
  metricColumn("rushing_power", 35),
  metricColumn("maximum_speed", 10),
  metricColumn("hitting_power", 5),
  metricColumn("pass_interceptions", 40),
];

export const KICKER_COLUMNS: readonly MetricColumn[] = [
  metricColumn("kicking_ability", 100),
];

export const PUNTER_COLUMNS: readonly MetricColumn[] = [
  metricColumn("kicking_ability", 100),
];

export const OFFENSIVE_HP_SCORE_MAP = {
  75: 5,
  81: 25,
  88: 60,
  94: 100,
};

export const OFFENSIVE_LINE_HP_SCORE_MAP = {
  31: 0,
  38: 15,
  44: 30,
  50: 45,
  56: 55,
  63: 65,
  69: 80,
  75: 90,
  81: 100,
};

export const DEFENSIVE_HP_SCORE_MAP = {
  19: 0,
  25: 7,
  31: 16,
  38: 23,
  44: 30,
  50: 36,
  56: 45,
  63: 59,
  69: 78,
  75: 100,
};
