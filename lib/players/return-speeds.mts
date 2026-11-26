import { eligibleForPosition } from "./positions.mts";
import type { TeamData } from "../types.ts";

function starterSpeed(team: TeamData, position: "RT" | "SS"): number {
  const starters = team.players.filter(player => player.position === position);
  const speed = starters[0]?.maximum_speed;
  if (starters.length !== 1 || typeof speed !== "number" || !Number.isFinite(speed)) {
    throw new Error(`${team.full_name}: expected one ${position} with a maximum speed.`);
  }
  return speed;
}

// The game uses the starting right tackle's speed on kicks and the strong safety's on punts.
export function withReturnSpeeds(team: TeamData) {
  const kickSpeed = starterSpeed(team, "RT");
  const puntSpeed = starterSpeed(team, "SS");
  const players = team.players.map(player => eligibleForPosition(player, "kick-returners")
    ? { ...player, kick_return_maximum_speed: kickSpeed, punt_return_maximum_speed: puntSpeed }
    : { ...player });
  return { ...team, players };
}
