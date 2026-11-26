import type { PlayerRecord, TeamData, TeamSlug } from "@/lib/types";
import { catchChance } from "./catch-chance";

function playersWithSkill(players: PlayerRecord[], attribute: "pass_control" | "receptions" | "pass_interceptions") {
  return players.flatMap(player => {
    const skill = player[attribute];
    return skill === undefined ? [] : [{ name: player.name, position: player.position, skill }];
  });
}

export function catchTeam(slug: TeamSlug, { full_name, players }: TeamData) {
  return {
    slug, name: full_name,
    quarterbacks: playersWithSkill(players, "pass_control"),
    receivers: playersWithSkill(players, "receptions"),
    defenders: playersWithSkill(players, "pass_interceptions"),
  };
}

export type CatchTeam = ReturnType<typeof catchTeam>;
type Player = CatchTeam["quarterbacks"][number];

export function catchRows(qb: Player, receivers: readonly Player[], defenders: readonly Player[]) {
  return receivers.map(receiver => ({
    receiver,
    open: catchChance(qb.skill, receiver.skill),
    covered: Object.fromEntries(defenders.map(defender => [
      defender.position, catchChance(qb.skill, receiver.skill, defender.skill),
    ])),
  }));
}
