"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
}

interface EpisodeSelectorProps {
  tmdbId: string;
  onSelect: (season: number, episode: number) => void;
  initialSeason?: number;
  initialEpisode?: number;
}

export function EpisodeSelector({
  tmdbId,
  onSelect,
  initialSeason = 1,
  initialEpisode = 1,
}: EpisodeSelectorProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(true);

  // Fetch seasons on mount
  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      try {
        const res = await fetch(`/api/media/${tmdbId}/seasons`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSeasons(data.seasons);
        }
      } catch (err) {
        console.error("Failed to load seasons:", err);
      }
    }
    loadSeasons();
    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  // Fetch episodes when season changes
  useEffect(() => {
    let cancelled = false;
    async function loadEpisodes() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/media/${tmdbId}/seasons?season=${selectedSeason}`
        );
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setEpisodes(data.episodes);
        } else {
          setEpisodes([]);
        }
      } catch (err) {
        console.error("Failed to load episodes:", err);
        if (!cancelled) setEpisodes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadEpisodes();
    return () => {
      cancelled = true;
    };
  }, [tmdbId, selectedSeason]);

  function handleSeasonChange(season: number) {
    setSelectedSeason(season);
    setSelectedEpisode(1);
    onSelect(season, 1);
  }

  function handleEpisodeClick(episode: number) {
    setSelectedEpisode(episode);
    onSelect(selectedSeason, episode);
  }

  return (
    <div className="space-y-4">
      {/* Season selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => handleSeasonChange(Number(e.target.value))}
            className="appearance-none rounded-lg bg-surface-lighter px-4 py-2 pr-10 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand cursor-pointer"
          >
            {seasons.map((s) => (
              <option key={s.season_number} value={s.season_number}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        <span className="text-sm text-gray-500">
          {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Episode grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-surface-lighter"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {episodes.map((ep) => (
            <button
              key={ep.episode_number}
              onClick={() => handleEpisodeClick(ep.episode_number)}
              className={`rounded-lg p-3 text-left transition ${
                ep.episode_number === selectedEpisode
                  ? "bg-brand/20 ring-1 ring-brand"
                  : "bg-surface-lighter hover:bg-surface-light"
              }`}
            >
              <span className="text-xs font-bold text-gray-400">
                E{String(ep.episode_number).padStart(2, "0")}
              </span>
              <p className="mt-1 text-sm font-medium text-white line-clamp-2">
                {ep.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
