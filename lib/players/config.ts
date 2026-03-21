import type { MetricColumn, PositionPageConfig, PositionSlug } from "@/lib/types";

export const QB_NOTE =
  "All QBs have Running Speed 25, Rushing Power 69, and Hitting Power 13. Accuracy of Passing has no effect on performance.";
export const SKILL_POSITION_NOTE = "All RBs, WRs and TEs have Rushing Power 69.";
export const KICK_RETURN_NOTE =
  "Due to a programming glitch, all KRs have the same Maximum Speed as their team's RT.";
export const PUNT_RETURN_NOTE =
  "Due to a programming glitch, all PRs have the same Maximum Speed as their team's SS and Ball Control 44.";
export const OFFENSIVE_LINE_NOTE = "All OL have Running Speed 25 and Rushing Power 69.";
export const DEFENSE_NOTE = "Quickness has no effect on performance for any defensive player.";
export const KICKER_NOTE =
  "All kickers have Running Speed 56, Rushing Power 81, Maximum Speed 81, and Hitting Power 31.";
export const PUNTER_NOTE =
  "All punters have Running Speed 25, Rushing Power 56, Maximum Speed 44, and Hitting Power 31.";

export const QB_COLUMNS: readonly MetricColumn[] = [
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 25 },
  { key: "passing_speed", label: "PS", tooltip: "Passing Speed", weight: 20 },
  { key: "pass_control", label: "PC", tooltip: "Pass Control", weight: 50 },
  { key: "avoid_pass_block", label: "APB", tooltip: "Avoid Pass Block", weight: 5 },
];

export const RUSHING_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 70 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 10 },
  { key: "ball_control", label: "BC", tooltip: "Ball Control", weight: 5 },
  { key: "receptions", label: "REC", tooltip: "Receptions", weight: 5 },
];

export const RECEIVING_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 30 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 5 },
  { key: "ball_control", label: "BC", tooltip: "Ball Control", weight: 5 },
  { key: "receptions", label: "REC", tooltip: "Receptions", weight: 50 },
];

export const KICK_RETURN_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 20 },
  {
    key: "kick_return_maximum_speed",
    label: "MS",
    tooltip: "Maximum Speed",
    weight: 60,
  },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 10 },
  { key: "ball_control", label: "BC", tooltip: "Ball Control", weight: 10 },
];

export const PUNT_RETURN_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 20 },
  {
    key: "punt_return_maximum_speed",
    label: "MS",
    tooltip: "Maximum Speed",
    weight: 70,
  },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 10 },
];

export const OFFENSIVE_LINE_COLUMNS: readonly MetricColumn[] = [
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 50 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 50 },
];

export const DEFENSIVE_LINE_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "rushing_power", label: "RP", tooltip: "Rushing Power", weight: 35 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 10 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 40 },
  { key: "pass_interceptions", label: "PI", tooltip: "Pass Interceptions", weight: 5 },
];

export const LINEBACKER_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "rushing_power", label: "RP", tooltip: "Rushing Power", weight: 35 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 10 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 30 },
  { key: "pass_interceptions", label: "PI", tooltip: "Pass Interceptions", weight: 15 },
];

export const SECONDARY_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "rushing_power", label: "RP", tooltip: "Rushing Power", weight: 35 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 10 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 5 },
  { key: "pass_interceptions", label: "PI", tooltip: "Pass Interceptions", weight: 40 },
];

export const KICKING_COLUMNS: readonly MetricColumn[] = [
  { key: "kicking_ability", label: "KA", tooltip: "Kicking Ability", weight: 70 },
  {
    key: "avoid_kick_block",
    label: "AKB",
    tooltip: "Avoid Kick Block",
    weight: 30,
  },
];

export const POSITION_PAGES: readonly PositionPageConfig[] = [
  {
    slug: "qb",
    title: "Quarterbacks",
    navLabel: "Quarterbacks",
    homeLabel: "Top Quarterbacks",
    dataFile: "qb.json",
    note: QB_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 56 QBs",
    columns: QB_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "rushers",
    title: "Rushers",
    navLabel: "Rushers",
    homeLabel: "Top Rushers",
    dataFile: "rushers.json",
    note: SKILL_POSITION_NOTE,
    rankingKey: "rushing_ranking",
    ratingKey: "rushing_rating",
    rankingTooltip: "Out of all rushers",
    columns: RUSHING_COLUMNS,
    homeLimit: 9,
    homeExcludePositions: ["WR2", "WR3"],
    filters: [
      { id: "all", label: "RBs, WRs & TEs", allowedPrefixes: [] },
      { id: "only-rb", label: "Only RBs", allowedPrefixes: ["RB"] },
    ],
    defaultFilterId: "all",
  },
  {
    slug: "receivers",
    title: "Receivers",
    navLabel: "Receivers",
    homeLabel: "Top Receivers",
    dataFile: "receivers.json",
    note: SKILL_POSITION_NOTE,
    rankingKey: "receiving_ranking",
    ratingKey: "receiving_rating",
    rankingTooltip: "Out of all receivers",
    columns: RECEIVING_COLUMNS,
    homeLimit: 5,
    filters: [
      { id: "all", label: "RBs, WRs & TEs", allowedPrefixes: [] },
      { id: "only-wr", label: "Only WRs & TEs", allowedPrefixes: ["WR", "TE"] },
    ],
    defaultFilterId: "all",
  },
  {
    slug: "kick-returners",
    title: "Kick Returners",
    navLabel: "Kick Returners",
    homeLabel: "Top Kick Returners",
    dataFile: "kick-returners.json",
    note: KICK_RETURN_NOTE,
    rankingKey: "kick_return_ranking",
    ratingKey: "kick_return_rating",
    rankingTooltip: "Out of all kick returners",
    columns: KICK_RETURN_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "punt-returners",
    title: "Punt Returners",
    navLabel: "Punt Returners",
    homeLabel: "Top Punt Returners",
    dataFile: "punt-returners.json",
    note: PUNT_RETURN_NOTE,
    rankingKey: "punt_return_ranking",
    ratingKey: "punt_return_rating",
    rankingTooltip: "Out of 280 punt returners",
    columns: PUNT_RETURN_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "ol",
    title: "Offensive Linemen",
    navLabel: "Offensive Linemen",
    homeLabel: "Top O-Linemen",
    dataFile: "ol.json",
    note: OFFENSIVE_LINE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 140 OL",
    columns: OFFENSIVE_LINE_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "dl",
    title: "Defensive Linemen",
    navLabel: "Defensive Linemen",
    homeLabel: "Top D-Linemen",
    dataFile: "dl.json",
    note: DEFENSE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 84 DL",
    columns: DEFENSIVE_LINE_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "lb",
    title: "Linebackers",
    navLabel: "Linebackers",
    homeLabel: "Top Linebackers",
    dataFile: "lb.json",
    note: DEFENSE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 112 LBs",
    columns: LINEBACKER_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "cb-s",
    title: "Cornerbacks & Safeties",
    navLabel: "Secondary",
    homeLabel: "Top CB & S",
    dataFile: "cb-s.json",
    note: DEFENSE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 112 CB & S",
    columns: SECONDARY_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "k",
    title: "Kickers",
    navLabel: "Kickers",
    homeLabel: "Top Kickers",
    dataFile: "k.json",
    note: KICKER_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 28 kickers",
    columns: KICKING_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "p",
    title: "Punters",
    navLabel: "Punters",
    homeLabel: "Top Punters",
    dataFile: "p.json",
    note: PUNTER_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 28 punters",
    columns: KICKING_COLUMNS,
    homeLimit: 5,
  },
];

export const POSITION_PAGE_CONFIG_MAP = Object.fromEntries(
  POSITION_PAGES.map((page) => [page.slug, page]),
) as Record<PositionSlug, PositionPageConfig>;

export const PLAYER_NAV_GROUPS = [
  [
    POSITION_PAGE_CONFIG_MAP.qb,
    POSITION_PAGE_CONFIG_MAP.rushers,
    POSITION_PAGE_CONFIG_MAP.receivers,
    POSITION_PAGE_CONFIG_MAP["kick-returners"],
    POSITION_PAGE_CONFIG_MAP["punt-returners"],
    POSITION_PAGE_CONFIG_MAP.ol,
  ],
  [
    POSITION_PAGE_CONFIG_MAP.dl,
    POSITION_PAGE_CONFIG_MAP.lb,
    POSITION_PAGE_CONFIG_MAP["cb-s"],
    POSITION_PAGE_CONFIG_MAP.k,
    POSITION_PAGE_CONFIG_MAP.p,
  ],
] as const;

export function getPositionPageConfig(slug: string): PositionPageConfig | null {
  if (!(slug in POSITION_PAGE_CONFIG_MAP)) {
    return null;
  }

  return POSITION_PAGE_CONFIG_MAP[slug as PositionSlug];
}
