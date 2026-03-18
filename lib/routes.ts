import type { Route } from "next";

import type { PositionSlug, TeamSlug } from "@/lib/types";

export const homeRoute = "/" as Route;
export const aboutRatingsRoute = "/about/ratings/" as Route;
export const aboutRankingsRoute = "/about/rankings/" as Route;

export function playerRoute(slug: PositionSlug): Route {
  return `/players/${slug}/` as Route;
}

export function teamRoute(slug: TeamSlug): Route {
  return `/teams/${slug}/` as Route;
}
