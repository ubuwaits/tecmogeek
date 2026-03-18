import Link from "next/link";

import { PLAYER_NAV_GROUPS, TEAM_GROUPS, getTeamLabel } from "@/lib/site-config";
import { playerRoute, teamRoute } from "@/lib/routes";
import { HelmetSprite } from "@/components/sprites";

export function SiteFooter() {
  return (
    <footer className="mx-[-2rem] mb-[-2rem] mt-16 bg-[var(--dark-bg)] px-8 pb-4 pt-8">
      <section className="flex">
        <ol className="basis-1/5">
          <li>
            <h6 className="mb-4 text-[14px] font-bold uppercase tracking-[0.025em] text-white">
              Positions
            </h6>
            <ol>
              {PLAYER_NAV_GROUPS.flat().map((page) => (
                <li key={page.slug}>
                  <Link
                    href={playerRoute(page.slug)}
                    className="mr-8 inline-block py-4 text-[14px] font-semibold text-white no-underline hover:text-[var(--pink)]"
                  >
                    {page.navLabel}
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        </ol>

        <ol className="flex basis-4/5 justify-around">
          {TEAM_GROUPS.map((group) => (
            <li key={group.title} className="mb-4 text-center">
              <h6 className="mb-4 text-[14px] font-bold uppercase tracking-[0.025em] text-white">
                {group.title}
              </h6>
              <ol>
                {group.teams.map((team) => (
                  <li key={team} className="text-center">
                    <Link
                      href={teamRoute(team)}
                      className="inline-block rounded p-4 text-[14px] font-semibold text-white no-underline hover:bg-[var(--pink)]"
                    >
                      <HelmetSprite team={team} size="large" />
                      <span className="mt-2 block">{getTeamLabel(team)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-[-2rem] mb-[-2rem] mt-4 border-t border-white/25 bg-black px-8 py-2 text-center text-[16px] text-white/65">
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
