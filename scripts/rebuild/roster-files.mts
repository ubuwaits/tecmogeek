import { TEAM_SLUGS } from "../../lib/teams/slugs.mts";
import type { TeamData } from "../../lib/types.ts";
import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.resolve(import.meta.dirname, "../../data");
export const TEAM_RATINGS_FILE_NAME = "team-ratings.json";

export function getTeamFileNames(): string[] {
  return TEAM_SLUGS.map(slug => slug + ".json");
}

export function formatTeamFile(team: { full_name: string; short_name: string; players: readonly unknown[] }) {
  const players = team.players.map((player) => `    ${JSON.stringify(player)}`).join(",\n");

  return `{\n  "full_name": ${JSON.stringify(team.full_name)},\n  "short_name": ${JSON.stringify(team.short_name)},\n  "players": [\n${players}\n  ]\n}\n`;
}

export async function readJson(fileName: string) {
  return JSON.parse(await fs.promises.readFile(path.join(DATA_DIR, fileName), "utf8"));
}

export async function writeFile(fileName: string, contents: string) {
  await fs.promises.writeFile(path.join(DATA_DIR, fileName), contents, "utf8");
}

export async function rebuildRosterPlayers(rebuild: (teams: TeamData[]) => void) {
  const files = getTeamFileNames();
  const teams = await Promise.all(files.map(readJson));
  const identities = new Set<string>();
  for (const team of teams) {
    for (const player of team.players) {
      const id = JSON.stringify([player.team, player.position, player.name]);
      if (identities.has(id)) throw new Error(`Duplicate roster player: ${id}`);
      identities.add(id);
    }
  }
  rebuild(teams);
  for (const [index, file] of files.entries()) {
    await writeFile(file, formatTeamFile(teams[index]));
  }
}
