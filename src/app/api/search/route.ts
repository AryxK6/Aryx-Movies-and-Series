import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  searchTMDB,
  fetchExternalIds,
  normalizeTitle,
  normalizeReleaseDate,
  normalizeMediaType,
} from "@/lib/tmdb";

/**
 * GET /api/search?q=<query>&type=<MOVIE|TV>
 *
 * Searches the local database first. If fewer than 5 results found,
 * falls back to TMDB live search and auto-saves new results to DB.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type"); // "MOVIE" or "TV"

  if (!query && !typeFilter) {
    return NextResponse.json({ results: [] });
  }

  try {
    // ── Step 1: Search local database ──────────────────
    const whereClause: Record<string, unknown> = {};

    if (query) {
      whereClause.title = { contains: query, mode: "insensitive" };
    }
    if (typeFilter === "MOVIE" || typeFilter === "TV") {
      whereClause.mediaType = typeFilter;
    }

    const localResults = await prisma.media.findMany({
      where: whereClause,
      orderBy: { voteAverage: "desc" },
      take: 20,
    });

    // ── Step 2: Fallback to TMDB if not enough local results ──
    if (query && localResults.length < 5) {
      const tmdbResults = await searchTMDB(query);

      // Filter by type if specified
      const filtered = typeFilter
        ? tmdbResults.filter(
            (r) => normalizeMediaType(r) === typeFilter
          )
        : tmdbResults;

      // Auto-save new results to the database
      const savedItems = await Promise.all(
        filtered.slice(0, 15).map(async (item) => {
          try {
            const mediaType = normalizeMediaType(item);
            const tmdbMediaType = mediaType === "TV" ? "tv" : "movie";
            const imdbId = await fetchExternalIds(item.id, tmdbMediaType as "movie" | "tv");

            return await prisma.media.upsert({
              where: {
                tmdbId_mediaType: { tmdbId: String(item.id), mediaType },
              },
              update: {
                title: normalizeTitle(item),
                posterPath: item.poster_path || "",
                backdropPath: item.backdrop_path || "",
                overview: item.overview || "",
                releaseDate: normalizeReleaseDate(item),
                voteAverage: item.vote_average || 0,
                ...(imdbId ? { imdbId } : {}),
              },
              create: {
                tmdbId: String(item.id),
                imdbId: imdbId || null,
                title: normalizeTitle(item),
                mediaType,
                posterPath: item.poster_path || "",
                backdropPath: item.backdrop_path || "",
                overview: item.overview || "",
                releaseDate: normalizeReleaseDate(item),
                voteAverage: item.vote_average || 0,
                genres: JSON.stringify(item.genre_ids || []),
              },
            });
          } catch {
            return null;
          }
        })
      );

      // Combine local + newly saved, deduplicate
      const allResults = [...localResults, ...savedItems.filter(Boolean)];
      const unique = Array.from(
        new Map(allResults.map((r) => [`${r!.mediaType}-${r!.tmdbId}`, r])).values()
      );

      return NextResponse.json({ results: unique });
    }

    return NextResponse.json({ results: localResults });
  } catch (error) {
    console.error("[SEARCH] Error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}
