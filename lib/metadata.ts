import type { Metadata, ResolvingMetadata } from "next";

export const SOCIAL_IMAGE_PATH = "/social-image.png";

type OpenGraphMetadata = NonNullable<Metadata["openGraph"]>;

export async function mergeOpenGraph(
  parent: ResolvingMetadata,
  openGraph: Partial<OpenGraphMetadata>,
): Promise<Metadata["openGraph"]> {
  const parentOpenGraph = (await parent).openGraph;

  return {
    ...(parentOpenGraph ?? {}),
    ...openGraph,
    url: openGraph.url ?? parentOpenGraph?.url ?? undefined,
  };
}
