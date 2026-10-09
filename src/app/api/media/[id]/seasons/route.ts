import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTVDetails, fetchSeasonEpisodes } from "@/lib/tmdb";

/**
 * GET /api/media/[id]/seasons?season=<number>
 *
 * Returns TV show season list or episodes for a specific season.
 * If `season` query param is provided, returns episodes for that season.
 * Otherwise, returns the list of seasons.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const seasonNumber = searchParams.get("season");

  try {
    // Look up the media item to get the TMDB ID
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.mediaType !== "TV") {
      return NextResponse.json(
        { error: "Not a TV show" },
        { status: 400 }
      );
    }

    const tmdbId = Number(media.tmdbId);

    if (seasonNumber) {
      // Return episodes for the specified season
      const episodes = await fetchSeasonEpisodes(tmdbId, Number(seasonNumber));
      return NextResponse.json({ episodes });
    }

    // Return list of seasons
    const seasons = await fetchTVDetails(tmdbId);
    return NextResponse.json({ seasons });
  } catch (error) {
    console.error("[SEASONS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch season data" },
      { status: 500 }
    );
  }
}
