import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TeamRatingSummaryCards } from "@/components/teams/team-rating-summary-cards";
import { HelmetSprite } from "@/components/ui/sprites";
import { TeamPlayerListsView } from "@/components/teams/team-player-lists-view";
import { getLeaderboardCounts, getTeam, getTeamRatings } from "@/lib/data";
import { pageMetadata } from "@/lib/site/metadata";
import { teamRoute, teamsRoute } from "@/lib/site/routes";
import { getTeamRatingSummaries } from "@/lib/teams/ratings";
import { isTeamSlug, TEAM_SLUG_SET } from "@/lib/teams/config";

type TeamPageProps = PageProps<"/teams/[slug]">;

export function generateStaticParams() {
  return [...TEAM_SLUG_SET].map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: TeamPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;

  if (!isTeamSlug(slug)) {
    return {};
  }

  const team = await getTeam(slug);

  return pageMetadata(parent, team.full_name, teamRoute(team.short_name));
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;

  if (!isTeamSlug(slug)) {
    notFound();
  }

  const [team, teamRatings, counts] = await Promise.all([getTeam(slug), getTeamRatings(), getLeaderboardCounts()]);
  const teamSlug = team.short_name;
  const ratingSummaries = getTeamRatingSummaries(teamRatings, teamSlug);

  return (
    <>
      <header className="mb-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] xl:items-center xl:gap-8">
          <h1 className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 self-center sm:gap-6">
            <HelmetSprite team={teamSlug} size="large" className="shrink-0 self-center" />
            <div className="font-(family-name:--font-tecmo) text-[20px] leading-snug text-balance uppercase md:text-[28px]">
              {team.full_name}
            </div>
          </h1>

          <Link
            href={teamsRoute}
            aria-label="View all team ratings"
            className="group block self-center xl:justify-self-end"
          >
            <TeamRatingSummaryCards items={ratingSummaries} />
          </Link>
        </div>
      </header>

      <TeamPlayerListsView team={team} teamSlug={teamSlug} counts={counts} />
    </>
  );
}
