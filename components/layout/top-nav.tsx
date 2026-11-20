"use client";

import { useEffect, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PLAYER_NAV_GROUPS } from "@/lib/players/config";
import { aboutRatingsRoute, homeRoute, playerRoute, teamRoute, teamsRoute } from "@/lib/site/routes";
import { TEAM_GROUPS } from "@/data/divisions";
import { getTeamLabel } from "@/lib/teams/config";
import { HelmetSprite } from "@/components/ui/sprites";

type Menu = "teams" | "players";
type NavState = {
  desktop: "closed" | Menu;
  mobile: "closed" | "root" | Menu;
};
type NavAction =
  | { type: "openDesktop" | "closeDesktop" | "toggleDesktop" | "toggleSection"; menu: Menu }
  | { type: "toggleMobile" | "dismiss" };

const initialNav: NavState = { desktop: "closed", mobile: "closed" };

function navigationReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "openDesktop":
      return { ...state, desktop: action.menu };
    case "closeDesktop":
      return state.desktop === action.menu ? { ...state, desktop: "closed" } : state;
    case "toggleDesktop":
      return { ...state, desktop: state.desktop === action.menu ? "closed" : action.menu };
    case "toggleMobile":
      return state.mobile === "closed" ? { desktop: "closed", mobile: "root" } : initialNav;
    case "toggleSection":
      if (state.mobile === "closed") return state;
      return { ...state, mobile: state.mobile === action.menu ? "root" : action.menu };
    case "dismiss":
      return initialNav;
  }
}

function DesktopMenu({
  menu,
  label,
  openMenu,
  dispatch,
  children,
}: {
  menu: Menu;
  label: string;
  openMenu: NavState["desktop"];
  dispatch: Dispatch<NavAction>;
  children: ReactNode;
}) {
  const expanded = openMenu === menu;
  const pointerType = useRef("");
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <li
      className="relative mr-6 text-white"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") dispatch({ type: "openDesktop", menu });
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" && expanded) dispatch({ type: "closeDesktop", menu });
      }}
      onBlur={(event) => {
        if (expanded && !event.currentTarget.contains(event.relatedTarget)) dispatch({ type: "closeDesktop", menu });
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) trigger.current?.focus();
      }}
    >
      <button
        ref={trigger}
        type="button"
        data-testid={`nav-${menu}`}
        aria-expanded={expanded}
        onPointerDown={(event) => {
          pointerType.current = event.pointerType;
        }}
        onClick={(event) => {
          // Keyboard and touch users activate the disclosure directly.
          if (event.detail === 0 || pointerType.current !== "mouse") {
            dispatch({ type: "toggleDesktop", menu });
          }
        }}
        className={`relative block cursor-pointer px-3 py-2 pr-7.5 font-(family-name:--font-tecmo) text-[13px] uppercase leading-none text-inherit no-underline ${
          expanded ? "rounded-t bg-(--dark-bg)" : ""
        }`}
      >
        {label}
        <span className="absolute right-2.5 top-2.25 h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white" />
      </button>
      {expanded && children}
    </li>
  );
}

function MobileMenuSection({
  menu,
  label,
  openMenu,
  dispatch,
  children,
}: {
  menu: Menu;
  label: string;
  openMenu: NavState["mobile"];
  dispatch: Dispatch<NavAction>;
  children: ReactNode;
}) {
  const expanded = openMenu === menu;

  return (
    <li>
      <button
        type="button"
        data-testid={`mobile-nav-section-${menu}`}
        aria-expanded={expanded}
        onClick={() => dispatch({ type: "toggleSection", menu })}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none text-white transition hover:bg-[#0f4faa]"
      >
        <span>{label}</span>
        <span
          className={`h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white transition ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && children}
    </li>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return <TopNavContent key={pathname} />;
}

function TopNavContent() {
  const [state, dispatch] = useReducer(navigationReducer, initialNav);
  const mobileNavOpen = state.mobile !== "closed";
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        dispatch({ type: "dismiss" });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dispatch({ type: "dismiss" });
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className="fixed left-0 top-0 z-999 w-full border-b border-white/15 bg-[#165ec9] shadow-[0_0_5px_0_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-4 sm:py-4">
        <h1 className="w-26.5 text-center font-(family-name:--font-tecmo) text-[18px] leading-none sm:w-35 sm:text-[22px]">
          <Link href={homeRoute} className="cursor-pointer text-inherit no-underline">
            Tecmo
            <br />
            Geek
          </Link>
        </h1>

        <button
          type="button"
          data-testid="mobile-nav-toggle"
          onClick={() => dispatch({ type: "toggleMobile" })}
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav-panel"
          className="ml-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-[#0f4faa]/60 text-white transition hover:bg-[#0f4faa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current transition ${
                mobileNavOpen ? "translate-y-1.75 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1.75 block h-0.5 w-5 rounded-full bg-current transition ${
                mobileNavOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-3.5 block h-0.5 w-5 rounded-full bg-current transition ${
                mobileNavOpen ? "-translate-y-1.75 -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        <nav className="ml-2 hidden sm:block">
          <ul className="flex">
            <DesktopMenu
              menu="teams"
              label="Teams"
              openMenu={state.desktop}
              dispatch={dispatch}
            >
              <div className="absolute left-0 top-full z-1000 w-150 rounded-br rounded-bl rounded-tr bg-(--dark-bg) px-0 py-3">
                <div className="px-3 pb-3">
                  <Link
                    href={teamsRoute}
                    className="flex min-h-11 items-center rounded bg-white/8 px-3 py-2 text-[15px] font-bold text-white no-underline transition hover:bg-(--pink)"
                  >
                    Team Ratings
                  </Link>
                </div>

                <ol className="flex flex-wrap">
                  {TEAM_GROUPS.map((group) => (
                    <li key={group.title} className="w-1/3">
                      <h6 className="sr-only">{group.title}</h6>
                      <ol>
                        {group.teams.map((team) => (
                          <li key={team}>
                            <Link
                              href={teamRoute(team)}
                              className="mx-3 flex cursor-pointer items-center rounded px-2 py-2 text-[16px] font-bold text-white no-underline hover:bg-(--pink)"
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
            </DesktopMenu>

            <DesktopMenu
              menu="players"
              label="Players"
              openMenu={state.desktop}
              dispatch={dispatch}
            >
              <div className="absolute left-0 top-full z-1000 w-100 rounded-br rounded-bl rounded-tr bg-(--dark-bg) px-0 py-3">
                <ol className="flex flex-wrap">
                  {PLAYER_NAV_GROUPS.map((group, groupIndex) => (
                    <li key={groupIndex} className="w-1/2">
                      <ol>
                        {group.map((page) => (
                          <li key={page.slug}>
                            <Link
                              href={playerRoute(page.slug)}
                              className="mx-3 block cursor-pointer rounded px-2 py-2 text-[16px] font-bold text-white no-underline hover:bg-(--pink)"
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
            </DesktopMenu>

            <li className="relative text-white">
              <Link
                href={aboutRatingsRoute}
                className="block cursor-pointer px-3 py-2 font-(family-name:--font-tecmo) text-[13px] uppercase leading-none text-inherit no-underline"
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
        inert={!mobileNavOpen}
      >
        <nav className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-4">
          <ul className="space-y-3">
            <MobileMenuSection menu="teams" label="Teams" openMenu={state.mobile} dispatch={dispatch}>
              <div className="space-y-4 pt-3">
                <Link
                  href={teamsRoute}
                  className="flex min-h-11 items-center rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 text-[14px] font-semibold text-white no-underline transition hover:bg-[#0f4faa]"
                >
                  Team Ratings
                </Link>

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
                            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white/8 px-3 py-2.5 text-[13px] font-semibold text-white no-underline transition hover:bg-white/14"
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
            </MobileMenuSection>

            <MobileMenuSection menu="players" label="Players" openMenu={state.mobile} dispatch={dispatch}>
              <div className="grid grid-cols-2 gap-2 pt-3">
                {PLAYER_NAV_GROUPS.flat().map((page) => (
                  <Link
                    key={page.slug}
                    href={playerRoute(page.slug)}
                    className="flex min-h-11 cursor-pointer items-center rounded-xl bg-white/8 px-3 py-2.5 text-[13px] font-semibold text-white no-underline transition hover:bg-white/14"
                  >
                    {page.navLabel}
                  </Link>
                ))}
              </div>
            </MobileMenuSection>

            <li>
              <Link
                href={aboutRatingsRoute}
                className="flex min-h-11 cursor-pointer items-center rounded-xl border border-white/15 bg-[#0f4faa]/60 px-4 py-3 font-(family-name:--font-tecmo) text-[14px] uppercase leading-none text-white no-underline transition hover:bg-[#0f4faa]"
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
