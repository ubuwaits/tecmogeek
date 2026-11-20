import type { Metadata, ResolvingMetadata } from "next";

import { AboutRatingsContent } from "@/components/about/about-ratings-content";
import { ArticlePage } from "@/components/layout/article-page";
import { pageMetadata } from "@/lib/site/metadata";
import { aboutRatingsRoute } from "@/lib/site/routes";

export async function generateMetadata(
  _: PageProps<"/about/ratings">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return pageMetadata(parent, "About player and team ratings", aboutRatingsRoute);
}

export default function RatingsPage() {
  return (
    <ArticlePage>
      <AboutRatingsContent />
    </ArticlePage>
  );
}
