"use client";

import { useState } from "react";
import { Player } from "@/components/Player";
import { EpisodeSelector } from "@/components/EpisodeSelector";
import { Star, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface WatchClientProps {
  id: string;
  title: string;
  overview: string;
  mediaType: "MOVIE" | "TV";
  imdbId: string | null;
  tmdbId: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
}

export function WatchClient({
  id,
  title,
  overview,
  mediaType,
  imdbId,
  backdropPath,
  releaseDate,
  voteAverage,
}: WatchClientProps) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const playableId = imdbId;
  const year = releaseDate?.split("-")[0];

  function handleEpisodeSelect(s: number, e: number) {
    setSeason(s);
    setEpisode(e);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Title & metadata */}
      <div>
        <h1 className="text-2xl font-bold text-white md:text-4xl">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
          <span className="rounded bg-brand/20 px-2 py-0.5 text-xs font-bold text-brand uppercase">
            {mediaType === "TV" ? "TV Series" : "Movie"}
          </span>
          {year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {year}
            </span>
          )}
          {voteAverage > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {voteAverage.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Player */}
      {playableId ? (
        <Player
          imdbId={playableId}
          mediaType={mediaType}
          season={mediaType === "TV" ? season : undefined}
          episode={mediaType === "TV" ? episode : undefined}
        />
      ) : (
        <div className="flex items-center justify-center rounded-lg bg-surface-lighter p-12">
          <p className="text-gray-400">
            No streaming source available for this title.
          </p>
        </div>
      )}

      {/* Episode selector for TV shows */}
      {mediaType === "TV" && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-white">Episodes</h2>
          <EpisodeSelector
            tmdbId={id}
            onSelect={handleEpisodeSelect}
            initialSeason={season}
            initialEpisode={episode}
          />
        </div>
      )}

      {/* Overview */}
      {overview && (
        <div>
          <h2 className="mb-2 text-lg font-bold text-white">Overview</h2>
          <p className="text-sm leading-relaxed text-gray-400">{overview}</p>
        </div>
      )}
    </div>
  );
}
