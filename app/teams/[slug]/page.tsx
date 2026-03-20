import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { HelmetSprite } from "@/components/sprites";
import { TeamPlayerListsView } from "@/components/team-player-lists-view";
import { getTeam } from "@/lib/data";
import { mergeOpenGraph } from "@/lib/metadata";
import { teamRoute } from "@/lib/routes";
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
  const canonicalSlug = isTeamSlug(team.short_name) ? team.short_name : slug;

  return {
    title: team.full_name,
    alternates: {
      canonical: teamRoute(canonicalSlug),
    },
    openGraph: await mergeOpenGraph(parent, {
      url: teamRoute(canonicalSlug),
      title: team.full_name,
    }),
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;

  if (!isTeamSlug(slug)) {
    notFound();
  }

  const team = await getTeam(slug);
  const teamSlug = isTeamSlug(team.short_name) ? team.short_name : slug;

  return (
    <>
      <header className="mb-8 sm:mb-12">
        <h1 className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 font-(family-name:--font-tecmo) text-[24px] uppercase sm:flex sm:items-center sm:gap-4 sm:text-[32px]">
          <HelmetSprite team={teamSlug} size="large" className="shrink-0 self-center" />
          <span className="block min-w-0 text-balance leading-snug">{team.full_name}</span>
        </h1>
      </header>

      <TeamPlayerListsView team={team} />
    </>
  );
}
