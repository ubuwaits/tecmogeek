import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { ArticleCaption, ArticlePage, ArticleParagraph, ArticleTitle } from "@/components/article-page";
import { aboutRatingsRoute, aboutRankingsRoute } from "@/lib/routes";

export const metadata: Metadata = {
  title: "About player ratings",
  alternates: {
    canonical: aboutRatingsRoute,
  },
  openGraph: {
    url: aboutRatingsRoute,
    title: "About player ratings",
  },
};

export default function RankingsRedirectPage() {
  return (
    <>
      <Script id="legacy-about-rankings-redirect" strategy="beforeInteractive">
        {`window.location.replace("/about/ratings/");`}
      </Script>

      <ArticlePage>
        <ArticleTitle className="mb-4">Redirecting</ArticleTitle>
        <ArticleParagraph className="mb-0 sm:leading-normal">
          This page has moved to{" "}
          <Link href={aboutRatingsRoute} className="font-bold text-(--blue)">
            /about/ratings/
          </Link>
          .
        </ArticleParagraph>
        <ArticleCaption className="mt-4">Legacy URL: {aboutRankingsRoute}</ArticleCaption>
      </ArticlePage>
    </>
  );
}
