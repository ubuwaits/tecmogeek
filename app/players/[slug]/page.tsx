import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PlayerListView } from "@/components/player-list-view";
import { getPositionEntries } from "@/lib/data";
import { mergeOpenGraph } from "@/lib/metadata";
import { getPositionPageConfig, POSITION_PAGES } from "@/lib/players/config";
import { playerRoute } from "@/lib/routes";

type PlayerPageProps = PageProps<"/players/[slug]">;

export function generateStaticParams() {
  return POSITION_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(
  { params }: PlayerPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const config = getPositionPageConfig(slug);

  if (!config) {
    return {};
  }

  return {
    title: config.title,
    alternates: {
      canonical: playerRoute(config.slug),
    },
    openGraph: await mergeOpenGraph(parent, {
      url: playerRoute(config.slug),
      title: config.title,
    }),
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const config = getPositionPageConfig(slug);

  if (!config) {
    notFound();
  }

  const entries = await getPositionEntries(config.slug);

  return <PlayerListView slug={config.slug} entries={entries} />;
}
