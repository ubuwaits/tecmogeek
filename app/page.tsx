import type { Metadata } from "next";
import Link from "next/link";

import { HeadshotSprite, HelmetSprite } from "@/components/ui/sprites";
import { XMentionsSection } from "@/components/home/x-mentions-section";
import { homeLeaderboards } from "@/lib/players/home-leaderboards";
import { getTeamRosters } from "@/lib/teams/data";
import { homeRoute, playerRoute, teamRoute } from "@/lib/site/routes";

export const metadata: Metadata = {
  title: "Comprehensive guide to Tecmo Super Bowl for NES",
  alternates: {
    canonical: homeRoute,
  },
};

export default async function HomePage() {
  const sectionData = homeLeaderboards(await getTeamRosters());

  return (
    <section data-page-theme="home" className="mx-auto w-full max-w-310">
      <h2 className="mx-auto mb-12 mt-4 max-w-200 text-center font-(family-name:--font-tecmo) text-xl leading-snug text-balance uppercase sm:mb-24 sm:mt-10 sm:text-[1.75em] sm:leading-normal">
        Comprehensive guide to player attributes in Tecmo Super Bowl for NES.
      </h2>

      <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
        {sectionData.map(({ page, players }) => (
          <div key={page.slug} className="min-w-0">
            <h3 className="pb-1 font-(family-name:--font-tecmo) text-[16px] leading-normal">
              <Link href={playerRoute(page.slug)} className="text-inherit no-underline hover:text-(--pink)">
                {page.homeLabel} &gt;
              </Link>
            </h3>

            <ol className="bg-(--dark-bg) px-0 py-3 shadow-[8px_8px_0_var(--pink)]">
              {players.map(({ name, position, number, teamName, teamSlug }) => (
                <li
                  key={`${page.slug}-${name}`}
                  className="flex items-center px-4 py-2 sm:px-5"
                >
                  <Link href={teamRoute(teamSlug)} aria-label={`${teamName} team page`} className="block w-8">
                    <HelmetSprite team={teamSlug} />
                  </Link>

                  <HeadshotSprite team={teamSlug} position={position} className="mx-3" />

                  <section>
                    <h3 className="font-(family-name:--font-tecmo) text-[14px] uppercase text-balance">
                      {name}
                    </h3>
                    <h4 className="font-(family-name:--font-tecmo) text-[12px] text-white/65">
                      {position} {number}
                    </h4>
                  </section>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <XMentionsSection />
    </section>
  );
}
