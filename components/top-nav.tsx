"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PLAYER_NAV_GROUPS, TEAM_GROUPS, getTeamLabel } from "@/lib/site-config";
import { aboutRatingsRoute, homeRoute, playerRoute, teamRoute } from "@/lib/routes";
import { HelmetSprite } from "@/components/sprites";

type OpenMenu = "teams" | "players" | null;

export function TopNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeAllMenus = useEffectEvent(() => {
    setOpenMenu(null);
    setMobileNavOpen(false);
    setMobileSection(null);
  });

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        closeAllMenus();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAllMenus();
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [pathname]);

  function toggleMobileNav() {
    setOpenMenu(null);
    setMobileNavOpen((current) => {
      const next = !current;

      if (next) {
        setMobileSection((openSection) => openSection ?? "teams");
      } else {
        setMobileSection(null);
      }

      return next;
    });
  }

  return (
    <header
      ref={navRef}
      className="fixed left-0 top-0 z-[999] w-full border-b border-white/15 bg-[#165ec9] shadow-[0_0_5px_0_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-4 sm:py-4">
        <h1 className="w-[106px] text-center font-(family-name:--font-tecmo) text-[18px] leading-none sm:w-[140px] sm:text-[22px]">
          <Link href={homeRoute} className="text-inherit no-underline">
            Tecmo
            <br />
            Geek
          </Link>
        </h1>

        <button
          type="button"
          data-testid="mobile-nav-toggle"
          onClick={toggleMobileNav}
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav-panel"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#0f4faa]/60 text-white transition hover:bg-[#0f4faa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current transition ${
                mobileNavOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current transition ${
                mobileNavOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-3.5 block h-0.5 w-5 rounded-full bg-current transition ${
                mobileNavOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        <nav className="ml-2 hidden sm:block">
          <ul className="flex">
            <li className="relative mr-6 text-white">
              <button
                type="button"
                data-testid="nav-teams"
                onClick={() => setOpenMenu((current) => (current === "teams" ? null : "teams"))}
                className={`relative block px-3 py-2 pr-[30px] font-(family-name:--font-tecmo) text-[13px] uppercase leading-none text-inherit no-underline ${
                  openMenu === "teams" ? "rounded-t bg-(--dark-bg)" : ""
                }`}
              >
                Teams
                <span className="absolute right-[10px] top-[9px] h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" />
              </button>

              {openMenu === "teams" ? (
                <div className="absolute left-0 top-full z-[1000] w-[600px] rounded-br rounded-bl rounded-tr bg-(--dark-bg) px-0 py-3">
                  <ol className="flex flex-wrap">
                    {TEAM_GROUPS.map((group) => (
                      <li key={group.title} className="w-1/3">
                        <h6 className="sr-only">{group.title}</h6>
                        <ol>
                          {group.teams.map((team) => (
                            <li key={team}>
                              <Link
                                href={teamRoute(team)}
                                className="mx-3 flex items-center rounded px-2 py-2 text-[16px] font-bold text-white no-underline hover:bg-(--pink)"
                              >
                                <HelmetSprite team={team} />
                                <span className="ml-2">{getTeamLabel(team)}</span>
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </li>

            <li className="relative mr-6 text-white">
              <button
                type="button"
                data-testid="nav-players"
                onClick={() => setOpenMenu((current) => (current === "players" ? null : "players"))}
                className={`relative block px-3 py-2 pr-[30px] font-(family-name:--font-tecmo) text-[13px] uppercase leading-none text-inherit no-underline ${
                  openMenu === "players" ? "rounded-t bg-(--dark-bg)" : ""
                }`}
              >
                Players
                <span className="absolute right-[10px] top-[9px] h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" />
              </button>

              {openMenu === "players" ? (
                <div className="absolute left-0 top-full z-[1000] w-[400px] rounded-br rounded-bl rounded-tr bg-(--dark-bg) px-0 py-3">
                  <ol className="flex flex-wrap">
                    {PLAYER_NAV_GROUPS.map((group, groupIndex) => (
                      <li key={groupIndex} className="w-1/2">
                        <ol>
                          {group.map((page) => (
                            <li key={page.slug}>
                              <Link
                                href={playerRoute(page.slug)}
                                className="mx-3 block rounded px-2 py-2 text-[16px] font-bold text-white no-underline hover:bg-(--pink)"
                              >
                                {page.navLabel}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </li>

            <li className="relative text-white">
              <Link
                href={aboutRatingsRoute}
                className="block px-3 py-2 font-(family-name:--font-tecmo) text-[13px] uppercase leading-none text-inherit no-underline"
              >
                About Ratings
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div
        id="mobile-nav-panel"
        data-testid="mobile-nav-panel"
        className={`absolute left-0 top-full w-full border-t border-white/12 bg-[#165ec9]/98 shadow-[0_18px_32px_rgba(0,0,0,0.3)] transition-[max-height,opacity] duration-200 sm:hidden ${
          mobileNavOpen ? "max-h-[calc(100vh-72px)] opacity-100" : "max-h-0 overflow-hidden opacity-0"
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <nav className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-4">
          <ul className="space-y-3">
            <li>
              <button
                type="button"
                data-testid="mobile-nav-section-teams"
                aria-expanded={mobileSection === "teams"}
                onClick={() =>
                  setMobileSection((current) => (current === "teams" ? null : "teams"))
                }
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none text-white transition hover:bg-[#0f4faa]"
              >
                <span>Teams</span>
                <span
                  className={`h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white transition ${
                    mobileSection === "teams" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSection === "teams" ? (
                <div className="space-y-4 pt-3">
                  {TEAM_GROUPS.map((group) => (
                    <section key={group.title}>
                      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                        {group.title}
                      </h2>
                      <ol className="grid grid-cols-2 gap-2">
                        {group.teams.map((team) => (
                          <li key={team}>
                            <Link
                              href={teamRoute(team)}
                              className="flex min-h-11 items-center gap-2 rounded-xl bg-white/8 px-3 py-2.5 text-[13px] font-semibold text-white no-underline transition hover:bg-white/14"
                            >
                              <HelmetSprite team={team} />
                              <span className="min-w-0 text-pretty">{getTeamLabel(team)}</span>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              ) : null}
            </li>

            <li>
              <button
                type="button"
                data-testid="mobile-nav-section-players"
                aria-expanded={mobileSection === "players"}
                onClick={() =>
                  setMobileSection((current) => (current === "players" ? null : "players"))
                }
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none text-white transition hover:bg-[#0f4faa]"
              >
                <span>Players</span>
                <span
                  className={`h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white transition ${
                    mobileSection === "players" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileSection === "players" ? (
                <div className="grid grid-cols-2 gap-2 pt-3">
                  {PLAYER_NAV_GROUPS.flat().map((page) => (
                    <Link
                      key={page.slug}
                      href={playerRoute(page.slug)}
                      className="flex min-h-11 items-center rounded-xl bg-white/8 px-3 py-2.5 text-[13px] font-semibold text-white no-underline transition hover:bg-white/14"
                    >
                      {page.navLabel}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>

            <li>
              <Link
                href={aboutRatingsRoute}
                className="flex min-h-11 items-center rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none text-white no-underline transition hover:bg-[#0f4faa]"
              >
                About Ratings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
