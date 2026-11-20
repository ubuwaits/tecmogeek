import { readTestRoster } from "./rosters";
import { positionEntries } from "../../lib/players/leaderboard";
import { POSITION_PAGE_CONFIG_MAP } from "../../lib/players/config";
import { TEAM_SLUGS, type PositionSlug } from "../../lib/types";

const players = TEAM_SLUGS.flatMap(slug => readTestRoster(slug).players);

export function leaderboard(slug: PositionSlug) {
  return positionEntries(players, POSITION_PAGE_CONFIG_MAP[slug]);
}
