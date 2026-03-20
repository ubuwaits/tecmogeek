import type { MetadataRoute } from "next";

import { POSITION_PAGES } from "@/lib/players/config";
import { homeRoute, aboutRatingsRoute, playerRoute, teamRoute } from "@/lib/routes";
import { TEAM_SLUG_SET } from "@/lib/teams/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL(homeRoute, "https://tecmogeek.com").toString() },
    { url: new URL(aboutRatingsRoute, "https://tecmogeek.com").toString() },
    ...POSITION_PAGES.map((page) => ({
      url: new URL(playerRoute(page.slug), "https://tecmogeek.com").toString(),
    })),
    ...[...TEAM_SLUG_SET].map((slug) => ({
      url: new URL(teamRoute(slug), "https://tecmogeek.com").toString(),
    })),
  ];
}
