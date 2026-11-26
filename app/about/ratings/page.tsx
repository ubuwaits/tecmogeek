import type { Metadata, ResolvingMetadata } from "next";

import { AboutRatingsContent } from "@/components/about/about-ratings-content";
import { getPositionEntries } from "@/lib/players/data";
import { ratingExamples } from "@/lib/players/rating-examples";
import { ArticlePage } from "@/components/layout/article-page";
import { pageMetadata } from "@/lib/site/metadata";
import { aboutRatingsRoute } from "@/lib/site/routes";

export async function generateMetadata(
  _: PageProps<"/about/ratings">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return pageMetadata(parent, "How player ratings are calculated", aboutRatingsRoute);
}

export default async function RatingsPage() {
  const examples = ratingExamples(await getPositionEntries("receivers"));
  return (
    <ArticlePage>
      <AboutRatingsContent examples={examples} />
    </ArticlePage>
  );
}
