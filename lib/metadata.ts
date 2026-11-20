import type { Metadata, ResolvingMetadata, Route } from "next";

export const SOCIAL_IMAGE_PATH = "/social-image.png";

export async function pageMetadata(parent: ResolvingMetadata, title: string, route: Route): Promise<Metadata> {
  return {
    title,
    alternates: { canonical: route },
    openGraph: { ...(await parent).openGraph, title, url: route },
  };
}
