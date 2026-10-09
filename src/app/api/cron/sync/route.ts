import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchTrending,
  fetchNowPlaying,
  fetchPopularTV,
  fetchExternalIds,
  normalizeTitle,
  normalizeReleaseDate,
  normalizeMediaType,
  type TMDBResult,
} from "@/lib/tmdb";

export const maxDuration = 60; // Vercel default (10s) is too short for a full sync

/**
 * POST or GET /api/cron/sync
 *
 * Secured cron endpoint that fetches trending/new content from TMDB
 * and upserts it into the local database with IMDb IDs.
 *
 * Protect with `Authorization: Bearer <CRON_SECRET>` header.
 */
export async function POST(request: NextRequest) {
  // ── Auth check ───────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Starting TMDB sync...");

    // ── Fetch content from multiple endpoints ──────────
    const [trending, nowPlaying, popularTV] = await Promise.all([
      fetchTrending(1),
      fetchNowPlaying(1),
      fetchPopularTV(1),
    ]);

    // Also fetch page 2 for more variety
    const [trending2, nowPlaying2, popularTV2] = await Promise.all([
      fetchTrending(2),
      fetchNowPlaying(2),
      fetchPopularTV(2),
    ]);

    // Combine and deduplicate by TMDB ID
    const allResults = [
      ...trending,
      ...trending2,
      ...nowPlaying,
      ...nowPlaying2,
      ...popularTV,
      ...popularTV2,
    ];

    const uniqueMap = new Map<string, TMDBResult>();
    for (const item of allResults) {
      if (item.id && (item.media_type === "movie" || item.media_type === "tv")) {
        uniqueMap.set(`${item.media_type}-${item.id}`, item);
      }
    }

    const uniqueResults = Array.from(uniqueMap.values());
    console.log(`[CRON] Fetched ${uniqueResults.length} unique items`);

    // ── Upsert each item ───────────────────────────────
    let synced = 0;
    let errors = 0;
    let firstError = "";

    // Process in batches of 10 to avoid rate-limiting
    for (let i = 0; i < uniqueResults.length; i += 10) {
      const batch = uniqueResults.slice(i, i + 10);

      await Promise.all(
        batch.map(async (item) => {
          try {
            const mediaType = normalizeMediaType(item);
            const tmdbMediaType = mediaType === "TV" ? "tv" : "movie";

            // Fetch IMDb ID
            const imdbId = await fetchExternalIds(item.id, tmdbMediaType as "movie" | "tv");

            await prisma.media.upsert({
              where: {
                tmdbId_mediaType: { tmdbId: String(item.id), mediaType },
              },
              update: {
                title: normalizeTitle(item),
                mediaType,
                posterPath: item.poster_path || "",
                backdropPath: item.backdrop_path || "",
                overview: item.overview || "",
                releaseDate: normalizeReleaseDate(item),
                voteAverage: item.vote_average || 0,
                genres: JSON.stringify(item.genre_ids || []),
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

            synced++;
          } catch (err) {
            console.error(`[CRON] Failed to upsert TMDB ID ${item.id}:`, err);
            errors++;
            if (!firstError) firstError = err instanceof Error ? err.message.slice(0, 500) : String(err);
          }
        })
      );

      // Small delay between batches to respect TMDB rate limits
      if (i + 10 < uniqueResults.length) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    console.log(`[CRON] Sync complete. Synced: ${synced}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      synced,
      errors,
      total: uniqueResults.length,
      ...(firstError ? { firstError } : {}),
    });
  } catch (error) {
    console.error("[CRON] Sync failed:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing (still requires auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
