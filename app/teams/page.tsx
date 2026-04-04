import type { Metadata, ResolvingMetadata } from "next";

import { TeamRatingsView } from "@/components/team-ratings-view";
import { getTeamRatings } from "@/lib/data";
import { mergeOpenGraph } from "@/lib/metadata";
import { teamsRoute } from "@/lib/routes";

export async function generateMetadata(
  _: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Team Ratings",
    alternates: {
      canonical: teamsRoute,
    },
    openGraph: await mergeOpenGraph(parent, {
      url: teamsRoute,
      title: "Team Ratings",
    }),
  };
}

export default async function TeamsPage() {
  const teams = await getTeamRatings();

  return (
    <>
      <header className="mb-8">
        <h1 className="font-(family-name:--font-tecmo) text-[20px] leading-snug text-balance uppercase md:text-[28px]">
          Team Ratings
        </h1>
        <p className="mt-1 max-w-3xl text-[14px] text-pretty text-white/65 md:text-[16px]">
          Overall, offensive, and defensive team ratings derived from the player ratings and Tecmo lineup rules.
        </p>
      </header>

      <TeamRatingsView teams={teams} />
    </>
  );
}
