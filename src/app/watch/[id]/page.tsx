import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WatchClient } from "./WatchClient";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { title: "Not found | Aryx Movies and Series" };
  return {
    title: `${media.title} | Aryx Movies and Series`,
    description: media.overview.slice(0, 160),
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) {
    notFound();
  }

  return (
    <WatchClient
      id={media.id}
      title={media.title}
      overview={media.overview}
      mediaType={media.mediaType as "MOVIE" | "TV"}
      imdbId={media.imdbId}
      tmdbId={media.tmdbId}
      backdropPath={media.backdropPath}
      releaseDate={media.releaseDate}
      voteAverage={media.voteAverage}
    />
  );
}
