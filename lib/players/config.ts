import type { PositionPageConfig, PositionSlug } from "@/lib/types";
import {
  QB_COLUMNS,
  RUSHING_COLUMNS,
  RECEIVING_COLUMNS,
  KICK_RETURN_COLUMNS,
  PUNT_RETURN_COLUMNS,
  OFFENSIVE_LINE_COLUMNS,
  DEFENSIVE_LINE_COLUMNS,
  LINEBACKER_COLUMNS,
  SECONDARY_COLUMNS,
  KICKER_COLUMNS,
  PUNTER_COLUMNS,
} from "./metrics.ts";

const QB_NOTE =
  "All QBs have Running Speed 25, Rushing Power 69, and Hitting Power 13. Accuracy of Passing has no effect on performance.";
const SKILL_POSITION_NOTE = "All RBs, WRs and TEs have Rushing Power 69.";
const KICK_RETURN_NOTE =
  "Due to a programming glitch, all KRs have the same Maximum Speed as their team's RT.";
const PUNT_RETURN_NOTE =
  "Due to a programming glitch, all PRs have the same Maximum Speed as their team's SS and Ball Control 44.";
const OFFENSIVE_LINE_NOTE =
  "All OL have Running Speed 25 and Rushing Power 69.";
const DEFENSE_NOTE =
  "Quickness has no effect on performance for any defensive player.";
const KICKER_NOTE =
  "All kickers have Running Speed 56, Rushing Power 81, Maximum Speed 81, and Hitting Power 31. Avoid Kick Block has no effect on performance, so kickers are ranked only by Kicking Ability.";
const PUNTER_NOTE =
  "All punters have Running Speed 25, Rushing Power 56, Maximum Speed 44, and Hitting Power 31. Punts cannot be blocked, so Avoid Kick Block has no effect on performance and punters are ranked only by Kicking Ability.";

type PositionPageConfigMap = {
  [Slug in PositionSlug]: PositionPageConfig & { slug: Slug };
};

export const POSITION_PAGE_CONFIG_MAP: PositionPageConfigMap = {
  qb: {
    slug: "qb",
    title: "Quarterbacks",
    navLabel: "Quarterbacks",
    homeLabel: "Top Quarterbacks",
    note: QB_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "QBs",
    columns: QB_COLUMNS,
    homeLimit: 5,
  },
  rushers: {
    slug: "rushers",
    title: "Rushers",
    navLabel: "Rushers",
    homeLabel: "Top Rushers",
    note: SKILL_POSITION_NOTE,
    rankingKey: "rushing_ranking",
    ratingKey: "rushing_rating",
    rankingGroupLabel: "rushers",
    columns: RUSHING_COLUMNS,
    homeLimit: 9,
    homeExcludePositions: ["WR2", "WR3"],
    filters: [
      { id: "all", label: "RBs, WRs & TEs", allowedPrefixes: [] },
      { id: "only-rb", label: "Only RBs", allowedPrefixes: ["RB"] },
    ],
    defaultFilterId: "all",
  },
  receivers: {
    slug: "receivers",
    title: "Receivers",
    navLabel: "Receivers",
    homeLabel: "Top Receivers",
    note: SKILL_POSITION_NOTE,
    rankingKey: "receiving_ranking",
    ratingKey: "receiving_rating",
    rankingGroupLabel: "receivers",
    columns: RECEIVING_COLUMNS,
    homeLimit: 5,
    filters: [
      { id: "all", label: "RBs, WRs & TEs", allowedPrefixes: [] },
      { id: "only-wr", label: "Only WRs & TEs", allowedPrefixes: ["WR", "TE"] },
    ],
    defaultFilterId: "all",
  },
  "kick-returners": {
    slug: "kick-returners",
    title: "Kick Returners",
    navLabel: "Kick Returners",
    homeLabel: "Top Kick Returners",
    note: KICK_RETURN_NOTE,
    rankingKey: "kick_return_ranking",
    ratingKey: "kick_return_rating",
    rankingGroupLabel: "kick returners",
    columns: KICK_RETURN_COLUMNS,
    homeLimit: 5,
  },
  "punt-returners": {
    slug: "punt-returners",
    title: "Punt Returners",
    navLabel: "Punt Returners",
    homeLabel: "Top Punt Returners",
    note: PUNT_RETURN_NOTE,
    rankingKey: "punt_return_ranking",
    ratingKey: "punt_return_rating",
    rankingGroupLabel: "punt returners",
    columns: PUNT_RETURN_COLUMNS,
    homeLimit: 5,
  },
  ol: {
    slug: "ol",
    title: "Offensive Linemen",
    navLabel: "Offensive Linemen",
    homeLabel: "Top O-Linemen",
    note: OFFENSIVE_LINE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "OL",
    columns: OFFENSIVE_LINE_COLUMNS,
    homeLimit: 5,
  },
  dl: {
    slug: "dl",
    title: "Defensive Linemen",
    navLabel: "Defensive Linemen",
    homeLabel: "Top D-Linemen",
    note: DEFENSE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "DL",
    columns: DEFENSIVE_LINE_COLUMNS,
    homeLimit: 5,
  },
  lb: {
    slug: "lb",
    title: "Linebackers",
    navLabel: "Linebackers",
    homeLabel: "Top Linebackers",
    note: DEFENSE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "LBs",
    columns: LINEBACKER_COLUMNS,
    homeLimit: 5,
  },
  "cb-s": {
    slug: "cb-s",
    title: "Cornerbacks & Safeties",
    navLabel: "Secondary",
    homeLabel: "Top CB & S",
    note: DEFENSE_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "CB & S",
    columns: SECONDARY_COLUMNS,
    homeLimit: 5,
  },
  k: {
    slug: "k",
    title: "Kickers",
    navLabel: "Kickers",
    homeLabel: "Top Kickers",
    note: KICKER_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "kickers",
    columns: KICKER_COLUMNS,
    homeLimit: 5,
  },
  p: {
    slug: "p",
    title: "Punters",
    navLabel: "Punters",
    homeLabel: "Top Punters",
    note: PUNTER_NOTE,
    rankingKey: "ranking",
    ratingKey: "rating",
    rankingGroupLabel: "punters",
    columns: PUNTER_COLUMNS,
    homeLimit: 5,
  },
};

export const POSITION_PAGES: readonly PositionPageConfig[] = Object.values(POSITION_PAGE_CONFIG_MAP);

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
  if (!Object.hasOwn(POSITION_PAGE_CONFIG_MAP, slug)) {
    return null;
  }

  return POSITION_PAGE_CONFIG_MAP[slug as PositionSlug];
}
