import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.resolve(import.meta.dirname, "../../data");
export const TEAM_RATINGS_FILE_NAME = "team-ratings.json";
const AGGREGATE_FILE_NAMES = new Set([
  "qb.json",
  "rushers.json",
  "receivers.json",
  "kick-returners.json",
  "punt-returners.json",
  "ol.json",
  "dl.json",
  "lb.json",
  "cb-s.json",
  "k.json",
  "p.json",
  TEAM_RATINGS_FILE_NAME,
]);

export function getTeamFileNames(): string[] {
  return fs
    .readdirSync(DATA_DIR)
    .filter((fileName) => fileName.endsWith(".json") && !AGGREGATE_FILE_NAMES.has(fileName))
    .sort();
}

export function getPlayerKey(player: { team: string; position: string; name: string }) {
  return `${player.team}|${player.position}|${player.name}`;
}

export function formatAggregateFile(rows: readonly unknown[]) {
  return `[${rows.map((row) => JSON.stringify(row)).join(",\n")}]\n`;
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
