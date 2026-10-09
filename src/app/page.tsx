import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/HeroBanner";
import { Carousel } from "@/components/Carousel";

// Read from the DB on each request (a build-time DB read fails on a fresh deploy)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch different categories from the database
  const [trending, newReleases, tvShows] = await Promise.all([
    prisma.media.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.media.findMany({
      where: { mediaType: "MOVIE" },
      orderBy: { releaseDate: "desc" },
      take: 20,
    }),
    prisma.media.findMany({
      where: { mediaType: "TV" },
      orderBy: { voteAverage: "desc" },
      take: 20,
    }),
  ]);

  // Pick a random high-rated item for the hero banner
  const heroPool = trending.filter(
    (m) => m.backdropPath && m.voteAverage > 6 && m.overview.length > 50
  );
  const heroItem = heroPool.length > 0
    ? heroPool[Math.floor(Math.random() * heroPool.length)]
    : trending[0];

  const isEmpty = trending.length === 0;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {heroItem && (
        <HeroBanner
          id={heroItem.id}
          title={heroItem.title}
          overview={heroItem.overview}
          backdropPath={heroItem.backdropPath}
          mediaType={heroItem.mediaType}
        />
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="mx-auto max-w-lg py-24 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            No Content Yet
          </h2>
          <p className="mb-6 text-gray-400">
            Run the sync cron job to populate your database with movies and TV
            shows from TMDB.
          </p>
          <code className="block rounded-lg bg-surface-lighter p-4 text-left text-sm text-green-400">
            {`curl -X POST \\
  -H "Authorization: Bearer YOUR_CRON_SECRET" \\
  http://localhost:3000/api/cron/sync`}
          </code>
        </div>
      )}

      {/* Content Carousels */}
      <div className="space-y-10 pt-4">
        <Carousel
          title="🔥 Trending Now"
          items={trending.map((m) => ({
            id: m.id,
            title: m.title,
            posterPath: m.posterPath,
            mediaType: m.mediaType,
            voteAverage: m.voteAverage,
            releaseDate: m.releaseDate,
          }))}
        />

        <Carousel
          title="🎬 New Movie Releases"
          items={newReleases.map((m) => ({
            id: m.id,
            title: m.title,
            posterPath: m.posterPath,
            mediaType: m.mediaType,
            voteAverage: m.voteAverage,
            releaseDate: m.releaseDate,
          }))}
        />

        <Carousel
          title="📺 Popular TV Series"
          items={tvShows.map((m) => ({
            id: m.id,
            title: m.title,
            posterPath: m.posterPath,
            mediaType: m.mediaType,
            voteAverage: m.voteAverage,
            releaseDate: m.releaseDate,
          }))}
        />
      </div>
    </div>
  );
}
