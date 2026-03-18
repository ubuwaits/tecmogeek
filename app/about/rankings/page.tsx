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
        className="mx-auto mt-4 max-w-[700px] text-[#3a3a3a] [text-shadow:0_1px_0_#fff] sm:mt-6"
      >
        <h1 className="mb-4 font-(family-name:--font-tecmo) text-[23px] leading-[0.95] uppercase text-balance text-[#3a3a3a] sm:text-[36px] sm:leading-[40px]">
          Redirecting
        </h1>
        <p className="text-[17px] leading-[1.6] text-pretty text-[#3a3a3a] sm:text-[18px] sm:leading-normal">
          This page has moved to{" "}
          <Link href={aboutRatingsRoute} className="font-bold text-(--blue)">
            /about/ratings/
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] text-[#626262] sm:text-[14px]">Legacy URL: {aboutRankingsRoute}</p>
      </section>
    </>
  );
}
