import { TEAM_SLUGS } from "../../lib/teams/slugs.mts";
import type { PlayerRecord } from "./team-rating-players.mts";
import fs from "node:fs";
import path from "node:path";

export type TeamData = {
  full_name: string;
  players: PlayerRecord[];
};

export const DATA_DIR = path.resolve(import.meta.dirname, "../../data");
export const TEAM_RATINGS_FILE_NAME = "team-ratings.json";

export function getTeamFileNames(): string[] {
  return TEAM_SLUGS.map(slug => slug + ".json");
}

export function formatTeamFile(team: { full_name: string; players: readonly unknown[] }) {
  const players = team.players.map((player) => `    ${JSON.stringify(player)}`).join(",\n");

  return `{\n  "full_name": ${JSON.stringify(team.full_name)},\n  "players": [\n${players}\n  ]\n}\n`;
}

export function readTeamRosters() {
  const rosters = new Map<string, TeamData>();
  const identities = new Set<string>();
  for (const slug of TEAM_SLUGS) {
    const team: TeamData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, slug + ".json"), "utf8"));
    for (const player of team.players) {
      const id = JSON.stringify([slug, player.position, player.name]);
      if (identities.has(id)) throw new Error(`Duplicate roster player: ${id}`);
      identities.add(id);
    }
    rosters.set(slug, team);
  }
  return rosters;
}

export async function writeTeamRosters(rosters: ReadonlyMap<string, TeamData>) {
  for (const [slug, team] of rosters) {
    await fs.promises.writeFile(path.join(DATA_DIR, slug + ".json"), formatTeamFile(team), "utf8");
  }
}

export async function rebuildRosterPlayers(rebuild: (teams: TeamData[]) => void) {
  const rosters = readTeamRosters();
  rebuild([...rosters.values()]);
  await writeTeamRosters(rosters);
}
