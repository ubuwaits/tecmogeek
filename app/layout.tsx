import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { SITE_DESCRIPTION, SITE_TITLE_SUFFIX, SITE_URL } from "@/lib/site-config";

import "./globals.css";

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
    default: "Tecmo Geek",
    template: `%s — ${SITE_TITLE_SUFFIX}`,
  },
  description: SITE_DESCRIPTION,
  twitter: {
    card: "summary_large_image",
    creator: "@ubuwaits",
  },
  openGraph: {
    type: "website",
    title: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/images/tecmogeek.png",
      },
    ],
  },
  icons: {
    icon: "/favicon.png",
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
        <TopNav />
        <main id="container" className="pt-[82px] sm:pt-24">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
