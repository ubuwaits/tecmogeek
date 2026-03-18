import Link from "next/link";

import { PLAYER_NAV_GROUPS, TEAM_GROUPS, getTeamLabel } from "@/lib/site-config";
import { playerRoute, teamRoute } from "@/lib/routes";
import { HelmetSprite } from "@/components/sprites";

export function SiteFooter() {
  return (
    <footer className="mx-[-1rem] mb-[-1rem] mt-12 bg-[var(--dark-bg)] px-4 pb-4 pt-8 sm:mx-[-2rem] sm:mb-[-2rem] sm:mt-16 sm:px-8">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,220px)_1fr]">
        <ol>
          <li>
            <h6 className="mb-4 text-[14px] font-bold uppercase tracking-[0.025em] text-white">
              Positions
            </h6>
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-1">
              {PLAYER_NAV_GROUPS.flat().map((page) => (
                <li key={page.slug}>
                  <Link
                    href={playerRoute(page.slug)}
                    className="inline-flex min-h-10 items-center py-2 text-[14px] font-semibold text-white no-underline transition hover:text-[var(--pink)]"
                  >
                    {page.navLabel}
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        </ol>

        <ol className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {TEAM_GROUPS.map((group) => (
            <li key={group.title} className="text-left sm:text-center">
              <h6 className="mb-4 text-[14px] font-bold uppercase tracking-[0.025em] text-white">
                {group.title}
              </h6>
              <ol className="space-y-1">
                {group.teams.map((team) => (
                  <li key={team}>
                    <Link
                      href={teamRoute(team)}
                      className="flex items-center gap-3 rounded-xl p-3 text-[14px] font-semibold text-white no-underline transition hover:bg-[var(--pink)] sm:flex-col sm:gap-2 sm:p-4"
                    >
                      <HelmetSprite team={team} size="large" className="shrink-0" />
                      <span className="block text-balance">{getTeamLabel(team)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-[-1rem] mb-[-1rem] mt-6 border-t border-white/25 bg-black px-4 py-3 text-center text-[15px] text-white/65 sm:mx-[-2rem] sm:mb-[-2rem] sm:px-8 sm:py-2 sm:text-[16px]">
        <p>
          A labor of love by{" "}
          <a
            href="https://chad.is"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--pink)] no-underline"
          >
            Chad Mazzola
          </a>{" "}
          &bull; Also check out{" "}
          <a
            href="https://www.chadwin.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--pink)] no-underline"
          >
            Chadwin
          </a>
        </p>
      </section>
    </footer>
  );
}
