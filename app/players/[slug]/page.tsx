import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PlayerListView } from "@/components/players/player-list-view";
import { getPositionEntries } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
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

  return pageMetadata(parent, config.title, playerRoute(config.slug));
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const config = getPositionPageConfig(slug);

  if (!config) {
    notFound();
  }

  const entries = await getPositionEntries(config.slug);

  return (
    <>
      <header className="mb-8">
        <h1 className="font-(family-name:--font-tecmo) text-[20px] md:text-[28px] uppercase text-balance leading-snug">
          {config.title}
        </h1>
        <p className="mt-1 max-w-3xl text-[14px] md:text-[16px] text-pretty text-white/65">
          {config.note}
        </p>
      </header>

      <PlayerListView slug={config.slug} entries={entries} />
    </>
  );
}
