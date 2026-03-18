import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { SITE_DESCRIPTION, SITE_TITLE_SUFFIX, SITE_URL } from "@/lib/site-config";

import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter-roman.var.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/Inter-italic.var.woff2",
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
      <body className={`${inter.variable} ${tecmo.variable} bg-[var(--blue)] text-white antialiased`}>
        <TopNav />
        <main id="container" className="pt-[96px]">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
