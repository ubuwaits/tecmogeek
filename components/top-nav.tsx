"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { PLAYER_NAV_GROUPS, TEAM_GROUPS, getTeamLabel } from "@/lib/site-config";
import { aboutRatingsRoute, homeRoute, playerRoute, teamRoute } from "@/lib/routes";
import { HelmetSprite } from "@/components/sprites";

type OpenMenu = "teams" | "players" | null;

export function TopNav() {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-[999] flex w-full items-center border-b border-white/15 bg-[#165ec9] p-4 shadow-[0_0_5px_0_rgba(0,0,0,0.15)]">
      <h1 className="w-[140px] text-center font-[family-name:var(--font-tecmo)] text-[22px] leading-none">
        <Link href={homeRoute} className="text-inherit no-underline">
          Tecmo
          <br />
          Geek
        </Link>
      </h1>

      <nav ref={navRef} className="ml-6">
        <ul className="flex">
          <li className="relative mr-6 text-white">
            <button
              type="button"
              data-testid="nav-teams"
              onClick={() => setOpenMenu((current) => (current === "teams" ? null : "teams"))}
              className={`relative block px-3 py-2 pr-[30px] font-[family-name:var(--font-tecmo)] text-[13px] uppercase leading-none text-inherit no-underline ${
                openMenu === "teams" ? "rounded-t bg-[var(--dark-bg)]" : ""
              }`}
            >
              Teams
              <span className="absolute right-[10px] top-[9px] h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" />
            </button>

            {openMenu === "teams" ? (
              <div className="absolute left-0 top-full z-[1000] w-[600px] rounded-br rounded-bl rounded-tr bg-[var(--dark-bg)] px-0 py-3">
                <ol className="flex flex-wrap">
                  {TEAM_GROUPS.map((group) => (
                    <li key={group.title} className="w-1/3">
                      <h6 className="sr-only">{group.title}</h6>
                      <ol>
                        {group.teams.map((team) => (
                          <li key={team}>
                            <Link
                              href={teamRoute(team)}
                              className="mx-3 flex items-center rounded px-2 py-2 text-[16px] font-bold text-white no-underline hover:bg-[var(--pink)]"
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
              className={`relative block px-3 py-2 pr-[30px] font-[family-name:var(--font-tecmo)] text-[13px] uppercase leading-none text-inherit no-underline ${
                openMenu === "players" ? "rounded-t bg-[var(--dark-bg)]" : ""
              }`}
            >
              Players
              <span className="absolute right-[10px] top-[9px] h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" />
            </button>

            {openMenu === "players" ? (
              <div className="absolute left-0 top-full z-[1000] w-[400px] rounded-br rounded-bl rounded-tr bg-[var(--dark-bg)] px-0 py-3">
                <ol className="flex flex-wrap">
                  {PLAYER_NAV_GROUPS.map((group, groupIndex) => (
                    <li key={groupIndex} className="w-1/2">
                      <ol>
                        {group.map((page) => (
                          <li key={page.slug}>
                            <Link
                              href={playerRoute(page.slug)}
                              className="mx-3 block rounded px-2 py-2 text-[16px] font-bold text-white no-underline hover:bg-[var(--pink)]"
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
              className="block px-3 py-2 font-[family-name:var(--font-tecmo)] text-[13px] uppercase leading-none text-inherit no-underline"
            >
              About Ratings
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
