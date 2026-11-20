import type { Metadata, ResolvingMetadata } from "next";

import { AboutRatingsContent } from "@/components/about-ratings-content";
import { ArticlePage } from "@/components/article-page";
import { pageMetadata } from "@/lib/metadata";
import { aboutRatingsRoute } from "@/lib/routes";

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
