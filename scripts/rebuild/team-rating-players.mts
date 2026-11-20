const SKILL_POSITION_PREFIXES = ["RB", "WR", "TE"];

type RatingKey =
  | "rating"
  | "rushing_rating"
  | "receiving_rating"
  | "kick_return_rating"
  | "punt_return_rating";

export type PlayerRecord = {
  position: string;
  name: string;
  number: string;
  rating?: string | number;
  rushing_rating?: string | number;
  receiving_rating?: string | number;
  kick_return_rating?: string | number;
  punt_return_rating?: string | number;
  [key: string]: string | number | undefined;
};

export type RatedPlayer = PlayerRecord & {
  rosterIndex: number;
};

function parsePercent(value: string | number | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number.parseFloat(value.replace("%", "")) || 0;
}

export function getPlayerLabel(player: PlayerRecord): string {
  return `${player.name} (${player.position})`;
}

export function getPlayerRating(player: PlayerRecord, key: RatingKey): number {
  return parsePercent(player[key]);
}

export function isSkillPlayer(player: PlayerRecord): boolean {
  return SKILL_POSITION_PREFIXES.some((prefix) => player.position.startsWith(prefix));
}

export function sortPlayersByRating(players: readonly RatedPlayer[], key: RatingKey): RatedPlayer[] {
  return [...players].sort((left, right) => {
    const rightRating = getPlayerRating(right, key);
    const leftRating = getPlayerRating(left, key);

    if (rightRating !== leftRating) {
      return rightRating - leftRating;
    }

    return left.rosterIndex - right.rosterIndex;
  });
}
