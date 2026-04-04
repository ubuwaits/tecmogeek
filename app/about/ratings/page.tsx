import type { Metadata, ResolvingMetadata } from "next";

import { AboutRatingsContent } from "@/components/about-ratings-content";
import { ArticlePage } from "@/components/article-page";
import { mergeOpenGraph } from "@/lib/metadata";
import { aboutRatingsRoute } from "@/lib/routes";

export async function generateMetadata(
  _: PageProps<"/about/ratings">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "About player and team ratings",
    alternates: {
      canonical: aboutRatingsRoute,
    },
    openGraph: await mergeOpenGraph(parent, {
      url: aboutRatingsRoute,
      title: "About player and team ratings",
    }),
  };
}

export default function RatingsPage() {
  return (
    <ArticlePage>
      <AboutRatingsContent />
    </ArticlePage>
  );
}
