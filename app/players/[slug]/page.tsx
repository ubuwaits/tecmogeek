import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlayerLeaderboard } from "@/components/player-leaderboard";
import { getPositionEntries } from "@/lib/data";
import { playerRoute } from "@/lib/routes";
import { POSITION_PAGES, POSITION_PAGE_CONFIG_MAP } from "@/lib/site-config";
import type { PositionSlug } from "@/lib/types";

type PlayerPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return POSITION_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = POSITION_PAGE_CONFIG_MAP[slug as PositionSlug];

  if (!config) {
    return {};
  }

  return {
    title: config.title,
    alternates: {
      canonical: playerRoute(config.slug),
    },
    openGraph: {
      url: playerRoute(config.slug),
      title: config.title,
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const config = POSITION_PAGE_CONFIG_MAP[slug as PositionSlug];

  if (!config) {
    notFound();
  }

  const entries = await getPositionEntries(config.slug);

  return <PlayerLeaderboard slug={config.slug} entries={entries} />;
}
