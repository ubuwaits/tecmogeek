import { TEAM_SLUGS } from "../../lib/teams/slugs.mts";
import type { TeamData } from "../../lib/types.ts";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(import.meta.dirname, "../../data");

function formatTeamFile(team: TeamData) {
  const players = team.players.map(player => {
    const stored = { ...player };
    // Older rosters also carried their team label on every player.
    delete stored.team;
    delete stored.kick_return_maximum_speed;
    delete stored.punt_return_maximum_speed;
    return `    ${JSON.stringify(stored)}`;
  }).join(",\n");

  return `{\n  "full_name": ${JSON.stringify(team.full_name)},\n  "players": [\n${players}\n  ]\n}\n`;
}

export function parseTeamRoster(slug: string, text: string): TeamData {
  const team: TeamData = JSON.parse(text);
  const identities = new Set<string>();
  for (const player of team.players) {
    const id = JSON.stringify([slug, player.position, player.name]);
    if (identities.has(id)) throw new Error(`Duplicate roster player: ${id}`);
    identities.add(id);
  }
  return team;
}

export function readTeamRosters() {
  const rosters = new Map<string, TeamData>();
  for (const slug of TEAM_SLUGS) {
    const text = fs.readFileSync(path.join(DATA_DIR, slug + ".json"), "utf8");
    rosters.set(slug, parseTeamRoster(slug, text));
  }
  return rosters;
}

export async function writeTeamRosters(rosters: ReadonlyMap<string, TeamData>) {
  for (const [slug, team] of rosters) {
    await fs.promises.writeFile(path.join(DATA_DIR, slug + ".json"), formatTeamFile(team), "utf8");
  }
}
