import type {
  MetricColumn,
  PositionPageConfig,
  PositionSlug,
  TeamGroup,
  TeamSectionConfig,
  TeamSkillMode,
  TeamSkillModeConfig,
  TeamSlug,
} from "@/lib/types";

export const SITE_URL = "https://tecmogeek.com";
export const SITE_DESCRIPTION =
  "Comprehensive guide to player attributes and rankings in Tecmo Super Bowl for NES.";
export const SITE_TITLE_SUFFIX = "Tecmo Geek. The ultimate guide to Tecmo Super Bowl for NES.";

export const QB_TEXT =
  "All QBs have Running Speed 25, Rushing Power 69, and Hitting Power 13. Accuracy of Passing has no affect on performance.";
export const RB_WR_TE_TEXT = "All RBs, WRs and TEs have Rushing Power 69.";
export const KR_TEXT =
  "Due to a programming glitch, all KRs have the same Maximum Speed as their team's RT.";
export const PR_TEXT =
  "Due to a programming glitch, all PRs have the same Maximum Speed as their team's SS and Ball Control 44.";
export const OL_TEXT = "All OL have Running Speed 25 and Rushing Power 69.";
export const DEFENSE_TEXT = "Quickness has no affect on performance for any defensive player.";
export const K_TEXT =
  "All kickers have Running Speed 56, Rushing Power 81, Maximum Speed 81, and Hitting Power 31.";
export const P_TEXT =
  "All punters have Running Speed 25, Rushing Power 56, Maximum Speed 44, and Hitting Power 31.";

const QB_COLUMNS: readonly MetricColumn[] = [
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 25 },
  { key: "passing_speed", label: "PS", tooltip: "Passing Speed", weight: 20 },
  { key: "pass_control", label: "PC", tooltip: "Pass Control", weight: 50 },
  { key: "avoid_pass_block", label: "APB", tooltip: "Avoid Pass Block", weight: 5 },
];

const RUSHING_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 70 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 10 },
  { key: "ball_control", label: "BC", tooltip: "Ball Control", weight: 5 },
  { key: "receptions", label: "REC", tooltip: "Receptions", weight: 5 },
];

const RECEIVING_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 30 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 5 },
  { key: "ball_control", label: "BC", tooltip: "Ball Control", weight: 5 },
  { key: "receptions", label: "REC", tooltip: "Receptions", weight: 50 },
];

const KICK_RETURN_COLUMNS: readonly MetricColumn[] = [
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

const PUNT_RETURN_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 20 },
  {
    key: "punt_return_maximum_speed",
    label: "MS",
    tooltip: "Maximum Speed",
    weight: 70,
  },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 10 },
];

const OL_COLUMNS: readonly MetricColumn[] = [
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 50 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 50 },
];

const DL_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "rushing_power", label: "RP", tooltip: "Rushing Power", weight: 35 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 10 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 40 },
  { key: "pass_interceptions", label: "PI", tooltip: "Pass Interceptions", weight: 5 },
];

const LB_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "rushing_power", label: "RP", tooltip: "Rushing Power", weight: 35 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 10 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 30 },
  { key: "pass_interceptions", label: "PI", tooltip: "Pass Interceptions", weight: 15 },
];

const SECONDARY_COLUMNS: readonly MetricColumn[] = [
  { key: "running_speed", label: "RS", tooltip: "Running Speed", weight: 10 },
  { key: "rushing_power", label: "RP", tooltip: "Rushing Power", weight: 35 },
  { key: "maximum_speed", label: "MS", tooltip: "Maximum Speed", weight: 10 },
  { key: "hitting_power", label: "HP", tooltip: "Hitting Power", weight: 5 },
  { key: "pass_interceptions", label: "PI", tooltip: "Pass Interceptions", weight: 40 },
];

const KICKING_COLUMNS: readonly MetricColumn[] = [
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
    note: QB_TEXT,
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
    note: RB_WR_TE_TEXT,
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
    note: RB_WR_TE_TEXT,
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
    note: KR_TEXT,
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
    note: PR_TEXT,
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
    note: OL_TEXT,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 140 OL",
    columns: OL_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "dl",
    title: "Defensive Linemen",
    navLabel: "Defensive Linemen",
    homeLabel: "Top D-Linemen",
    dataFile: "dl.json",
    note: DEFENSE_TEXT,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 84 DL",
    columns: DL_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "lb",
    title: "Linebackers",
    navLabel: "Linebackers",
    homeLabel: "Top Linebackers",
    dataFile: "lb.json",
    note: DEFENSE_TEXT,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 112 LBs",
    columns: LB_COLUMNS,
    homeLimit: 5,
  },
  {
    slug: "cb-s",
    title: "Cornerbacks & Safeties",
    navLabel: "Secondary",
    homeLabel: "Top CB & S",
    dataFile: "cb-s.json",
    note: DEFENSE_TEXT,
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
    note: K_TEXT,
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
    note: P_TEXT,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingTooltip: "Out of 28 punters",
    columns: KICKING_COLUMNS,
    homeLimit: 5,
  },
] as const;

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

export const TEAM_GROUPS: readonly TeamGroup[] = [
  { title: "AFC East", teams: ["bills", "colts", "dolphins", "patriots", "jets"] },
  { title: "AFC Central", teams: ["bengals", "browns", "oilers", "steelers"] },
  { title: "AFC West", teams: ["broncos", "chiefs", "raiders", "chargers", "seahawks"] },
  { title: "NFC East", teams: ["redskins", "giants", "eagles", "cardinals", "cowboys"] },
  { title: "NFC Central", teams: ["bears", "lions", "packers", "vikings", "buccaneers"] },
  { title: "NFC West", teams: ["49ers", "rams", "saints", "falcons"] },
] as const satisfies readonly TeamGroup[];

export const TEAM_NAME_MAP: Record<TeamSlug, string> = {
  "49ers": "49ers",
  bears: "Bears",
  bengals: "Bengals",
  bills: "Bills",
  broncos: "Broncos",
  browns: "Browns",
  buccaneers: "Buccaneers",
  cardinals: "Cardinals",
  chargers: "Chargers",
  chiefs: "Chiefs",
  colts: "Colts",
  cowboys: "Cowboys",
  dolphins: "Dolphins",
  eagles: "Eagles",
  falcons: "Falcons",
  giants: "Giants",
  jets: "Jets",
  lions: "Lions",
  oilers: "Oilers",
  packers: "Packers",
  patriots: "Patriots",
  raiders: "Raiders",
  rams: "Rams",
  redskins: "Redskins",
  saints: "Saints",
  seahawks: "Seahawks",
  steelers: "Steelers",
  vikings: "Vikings",
};

export const TEAM_SECTION_CONFIGS: readonly TeamSectionConfig[] = [
  {
    id: "qb",
    range: [0, 1],
    rankingLabel: "QB Ranking",
    rankingTooltip: "Out of 56 QBs",
    note: QB_TEXT,
    playerPage: "qb",
    columns: QB_COLUMNS,
  },
  {
    id: "ol",
    range: [12, 16],
    rankingLabel: "OL Ranking",
    rankingTooltip: "Out of 140 OL",
    note: OL_TEXT,
    playerPage: "ol",
    columns: OL_COLUMNS,
  },
  {
    id: "dl",
    range: [17, 19],
    rankingLabel: "DL Ranking",
    rankingTooltip: "Out of 84 DL",
    note: DEFENSE_TEXT,
    playerPage: "dl",
    columns: DL_COLUMNS,
  },
  {
    id: "lb",
    range: [20, 23],
    rankingLabel: "LB Ranking",
    rankingTooltip: "Out of 112 LBs",
    note: DEFENSE_TEXT,
    playerPage: "lb",
    columns: LB_COLUMNS,
  },
  {
    id: "secondary",
    range: [24, 27],
    rankingLabel: "CB/S Ranking",
    rankingTooltip: "Out of 112 CB & S",
    note: DEFENSE_TEXT,
    playerPage: "cb-s",
    columns: SECONDARY_COLUMNS,
  },
  {
    id: "k",
    range: [28, 28],
    rankingLabel: "K Ranking",
    rankingTooltip: "Out of 28 kickers",
    note: K_TEXT,
    playerPage: "k",
    columns: KICKING_COLUMNS,
  },
  {
    id: "p",
    range: [29, 29],
    rankingLabel: "P Ranking",
    rankingTooltip: "Out of 28 punters",
    note: P_TEXT,
    playerPage: "p",
    columns: KICKING_COLUMNS,
  },
] as const;

export const TEAM_SKILL_MODE_CONFIG: Record<TeamSkillMode, TeamSkillModeConfig> = {
  rushing: {
    id: "rushing",
    label: "Rushing",
    note: RB_WR_TE_TEXT,
    playerPage: "rushers",
    rankingKey: "rushing_ranking",
    ratingKey: "rushing_rating",
    columns: RUSHING_COLUMNS,
  },
  receiving: {
    id: "receiving",
    label: "Receiving",
    note: RB_WR_TE_TEXT,
    playerPage: "receivers",
    rankingKey: "receiving_ranking",
    ratingKey: "receiving_rating",
    columns: RECEIVING_COLUMNS,
  },
  "kick-return": {
    id: "kick-return",
    label: "Kick Returning",
    note: KR_TEXT,
    playerPage: "kick-returners",
    rankingKey: "kick_return_ranking",
    ratingKey: "kick_return_rating",
    columns: KICK_RETURN_COLUMNS,
  },
  "punt-return": {
    id: "punt-return",
    label: "Punt Returning",
    note: PR_TEXT,
    playerPage: "punt-returners",
    rankingKey: "punt_return_ranking",
    ratingKey: "punt_return_rating",
    columns: PUNT_RETURN_COLUMNS,
  },
};

export const DEFAULT_TEAM_SKILL_MODE: TeamSkillMode = "rushing";
export const TEAM_SKILL_RANGE = [2, 11] as const;

export function getTeamLabel(slug: TeamSlug): string {
  return TEAM_NAME_MAP[slug];
}
