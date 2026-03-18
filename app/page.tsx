import type { Metadata } from "next";
import Link from "next/link";

import { HeadshotSprite, HelmetSprite } from "@/components/sprites";
import { getPositionEntries } from "@/lib/data";
import { getHomeEntries, getTeamSlugFromCode } from "@/lib/player-utils";
import { homeRoute, playerRoute, teamRoute } from "@/lib/routes";
import { POSITION_PAGES } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Welcome",
  alternates: {
    canonical: homeRoute,
  },
  openGraph: {
    url: homeRoute,
  },
};

export default async function HomePage() {
  const sectionData = await Promise.all(
    POSITION_PAGES.map(async (page) => ({
      page,
      entries: getHomeEntries(page, await getPositionEntries(page.slug)),
    })),
  );

  return (
    <section data-page-theme="home">
      <h2 className="mx-auto mb-13 mt-3 max-w-[800px] text-center font-(family-name:--font-tecmo) text-[1.75em] leading-[1.5] uppercase">
        Comprehensive guide to player attributes in Tecmo Super Bowl for NES.
      </h2>

      <div className="flex flex-wrap justify-center">
        {sectionData.map(({ page, entries }) => (
          <div key={page.slug} className="m-8 basis-[380px]">
            <h3 className="pb-3 font-(family-name:--font-tecmo) text-[16px] leading-none">
              <Link href={playerRoute(page.slug)} className="text-inherit no-underline hover:text-(--pink)">
                {page.homeLabel} &gt;
              </Link>
            </h3>

            <ol className="bg-(--dark-bg) px-0 py-3 shadow-[8px_8px_0_var(--pink)]">
              {entries.map((entry) => {
                const teamSlug = getTeamSlugFromCode(entry.team);

                return (
                  <li
                    key={`${page.slug}-${entry.name}`}
                    className="flex items-center px-5 py-2"
                  >
                    <Link href={teamRoute(teamSlug)} className="block w-8">
                      <HelmetSprite team={teamSlug} />
                    </Link>

                    <HeadshotSprite team={teamSlug} position={entry.position as never} className="mx-3" />

                    <section>
                      <h3 className="font-(family-name:--font-tecmo) text-[14px] uppercase">
                        {entry.name}
                      </h3>
                      <h4 className="font-(family-name:--font-tecmo) text-[12px] text-white/65">
                        {entry.position} {entry.number}
                      </h4>
                    </section>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
