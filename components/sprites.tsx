import { HEADSHOT_POSITIONS, TEAM_SLUGS, type HeadshotPosition, type TeamSlug } from "@/lib/types";

type HelmetSize = "small" | "large";

function getTeamIndex(team: TeamSlug): number {
  return TEAM_SLUGS.indexOf(team);
}

function getHeadshotIndex(position: HeadshotPosition): number {
  return HEADSHOT_POSITIONS.indexOf(position);
}

export function HelmetSprite({
  team,
  size = "small",
  className = "",
}: {
  team: TeamSlug;
  size?: HelmetSize;
  className?: string;
}) {
  const teamIndex = getTeamIndex(team);
  const isLarge = size === "large";
  const dimension = isLarge ? 60 : 30;
  const step = isLarge ? 62 : 31;

  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-no-repeat align-middle ${className}`}
      style={{
        width: dimension,
        height: dimension,
        backgroundImage: "url(/images/helmets.png)",
        backgroundSize: isLarge ? undefined : "867px 30px",
        backgroundPosition: `${teamIndex * -step}px 0`,
      }}
    />
  );
}

export function HeadshotSprite({
  team,
  position,
  index,
  className = "",
}: {
  team: TeamSlug;
  position?: HeadshotPosition;
  index?: number;
  className?: string;
}) {
  const spriteIndex = typeof index === "number" ? index : getHeadshotIndex(position ?? "QB1");

  return (
    <span
      aria-hidden="true"
      className={`inline-block h-8 w-8 rounded-xs bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(/images/players/${team}.png)`,
        backgroundPosition: `${spriteIndex * -32}px 0`,
      }}
    />
  );
}
