import { POSITION_PAGES } from "../players/config.ts";
import { eligibleForPosition } from "../players/positions.mts";
import type { TeamData } from "../types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string, context: string) {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${context}: ${key} must be a nonempty string, received ${JSON.stringify(value)}`);
  }
  return value;
}

function validateRoster(slug: string, team: unknown): asserts team is TeamData {
  const file = `data/${slug}.json`;
  if (!isRecord(team)) throw new Error(`${file}: expected a roster object`);
  stringField(team, "full_name", file);
  if (!Array.isArray(team.players)) throw new Error(`${file}: players must be an array`);

  const identities = new Set<string>();
  for (const [index, player] of team.players.entries()) {
    const location = `${file}: players[${index}]`;
    if (!isRecord(player)) throw new Error(`${location}: expected a player object`);
    const position = stringField(player, "position", location);
    const name = stringField(player, "name", location);
    const context = `${file}: ${position} ${name}`;
    stringField(player, "number", context);
    const id = JSON.stringify([slug, position, name]);
    if (identities.has(id)) throw new Error(`Duplicate roster player: ${id}`);
    identities.add(id);

    const pages = POSITION_PAGES.filter(page => eligibleForPosition({ position }, page.slug));
    if (!pages.length) throw new Error(`${context}: unknown position ${JSON.stringify(position)}`);
    for (const page of pages) {
      for (const { key } of page.columns) {
        // Return speeds come from the starting RT and SS after reading the roster.
        if (key === "kick_return_maximum_speed" || key === "punt_return_maximum_speed") continue;
        const value = player[key];
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
          throw new Error(`${context}: ${key} must be an integer from 0 to 100, received ${JSON.stringify(value)}`);
        }
      }
    }
  }
}

export function parseTeamRoster(slug: string, text: string) {
  let team: unknown;
  try {
    team = JSON.parse(text);
  } catch (cause) {
    throw new Error(`data/${slug}.json: invalid JSON`, { cause });
  }
  validateRoster(slug, team);
  return team;
}
