import { getHeadshotSpriteIndex } from "@/lib/players/utils";
import { TEAM_SLUGS, type TeamSlug } from "@/lib/types";

type HelmetSize = "small" | "large";

function getTeamIndex(team: TeamSlug): number {
  return TEAM_SLUGS.indexOf(team);
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
  const dimension = size === "large" ? 60 : 30;

  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-no-repeat align-middle ${className}`}
      style={{
        width: dimension,
        height: dimension,
        backgroundImage: "url(/images/helmets-large.png)",
        imageRendering: size === "large" ? "pixelated" : "auto",
        backgroundSize: `${TEAM_SLUGS.length * dimension}px auto`,
        backgroundPosition: `${-teamIndex * dimension}px center`,
      }}
    />
  );
}

export function HeadshotSprite({
  team,
  position,
  className = "",
}: {
  team: TeamSlug;
  position: string;
  className?: string;
}) {
  const spriteIndex = getHeadshotSpriteIndex(position);

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
