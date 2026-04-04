import type { MetadataRoute } from "next";

import { POSITION_PAGES } from "@/lib/players/config";
import { homeRoute, aboutRatingsRoute, playerRoute, teamRoute, teamsRoute } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";
import { TEAM_SLUG_SET } from "@/lib/teams/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL(homeRoute, SITE_URL).toString() },
    { url: new URL(aboutRatingsRoute, SITE_URL).toString() },
    { url: new URL(teamsRoute, SITE_URL).toString() },
    ...POSITION_PAGES.map((page) => ({
      url: new URL(playerRoute(page.slug), SITE_URL).toString(),
    })),
    ...[...TEAM_SLUG_SET].map((slug) => ({
      url: new URL(teamRoute(slug), SITE_URL).toString(),
    })),
  ];
}
