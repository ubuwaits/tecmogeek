import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SOCIAL_IMAGE_PATH } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

const SITE_NAME = "Tecmo Geek";
const SITE_DESCRIPTION =
  "Comprehensive guide to player attributes and rankings in Tecmo Super Bowl for NES.";
const SITE_TITLE_SUFFIX = "Tecmo Geek. The ultimate guide to Tecmo Super Bowl for NES.";
const TWITTER_CREATOR = "@ubuwaits";

const inter = localFont({
  src: [
    {
      path: "./fonts/InterVariable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/InterVariable-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-inter",
});

const tecmo = localFont({
  src: "./fonts/gf-tecmoset1-webfont.woff",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-tecmo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_TITLE_SUFFIX}`,
  },
  description: SITE_DESCRIPTION,
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_CREATOR,
    images: [SOCIAL_IMAGE_PATH],
  },
  openGraph: {
    type: "website",
    title: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [SOCIAL_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${tecmo.variable} bg-(--blue) p-4 font-sans text-white antialiased sm:p-8`}>
        <TooltipProvider>
          <TopNav />
          <main id="container" className="pt-[82px] sm:pt-24">
            {children}
          </main>
          <SiteFooter />
          <Analytics />
        </TooltipProvider>
      </body>
    </html>
  );
}
