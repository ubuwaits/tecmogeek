import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HelmetSprite } from "@/components/sprites";
import { TeamSections } from "@/components/team-sections";
import { getTeam } from "@/lib/data";
import { teamRoute } from "@/lib/routes";
import type { TeamSlug } from "@/lib/types";
import { TEAM_GROUPS } from "@/lib/site-config";

type TeamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const TEAM_SLUG_SET = new Set(TEAM_GROUPS.flatMap((group) => group.teams));

export function generateStaticParams() {
  return [...TEAM_SLUG_SET].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!TEAM_SLUG_SET.has(slug as TeamSlug)) {
    return {};
  }

  const team = await getTeam(slug as TeamSlug);

  return {
    title: team.full_name,
    alternates: {
      canonical: teamRoute(team.short_name as TeamSlug),
    },
    openGraph: {
      url: teamRoute(team.short_name as TeamSlug),
      title: team.full_name,
    },
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;

  if (!TEAM_SLUG_SET.has(slug as TeamSlug)) {
    notFound();
  }

      const team = await getTeam(slug as TeamSlug);

  return (
    <>
      <header className="mb-8 sm:mb-12">
        <h1 className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 font-(family-name:--font-tecmo) text-[26px] uppercase sm:flex sm:items-center sm:gap-4 sm:text-[32px]">
          <HelmetSprite team={team.short_name as TeamSlug} size="large" className="shrink-0 self-center" />
          <span className="block min-w-0 text-balance leading-[1.02] sm:leading-none">{team.full_name}</span>
        </h1>
      </header>

      <TeamSections team={team} />
    </>
  );
}
