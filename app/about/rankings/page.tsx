import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

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

      <section
        data-page-theme="text"
        className="mx-auto mt-6 max-w-[700px] text-[#3a3a3a] [text-shadow:0_1px_0_#fff]"
      >
        <h1 className="mb-4 font-[family-name:var(--font-tecmo)] text-[36px] leading-[40px] uppercase text-[#3a3a3a]">
          Redirecting
        </h1>
        <p className="text-[18px] leading-[1.5] text-[#3a3a3a]">
          This page has moved to{" "}
          <Link href={aboutRatingsRoute} className="font-bold text-[var(--blue)]">
            /about/ratings/
          </Link>
          .
        </p>
        <p className="mt-4 text-[14px] text-[#626262]">Legacy URL: {aboutRankingsRoute}</p>
      </section>
    </>
  );
}
