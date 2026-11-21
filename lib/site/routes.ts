import type { Route } from "next";

import type { PositionSlug, TeamSlug } from "@/lib/types";

export const homeRoute = "/" as Route;
export const aboutRatingsRoute = "/about/ratings/" as Route;
export const cpuRoute = "/about/cpu/" as Route;
export const aboutTeamRatingsRoute = "/about/team-ratings/" as Route;
export const passCatchRoute = "/about/pass-catch-chances/" as Route;
export const aboutPages = [
  { href: aboutRatingsRoute, label: "Player Ratings" },
  { href: aboutTeamRatingsRoute, label: "Team Ratings" },
  { href: cpuRoute, label: "How the CPU plays" },
  { href: passCatchRoute, label: "Pass Catch Chances" },
];

export const teamsRoute = "/teams/" as Route;

export function playerRoute(slug: PositionSlug): Route {
  return `/players/${slug}/` as Route;
}

export function teamRoute(slug: TeamSlug): Route {
  return `/teams/${slug}/` as Route;
}
