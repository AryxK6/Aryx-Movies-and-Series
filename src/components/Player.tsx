"use client";

import { useState, useCallback } from "react";
import { EMBED_PROVIDERS, getEmbedUrl } from "@/lib/embed";

interface PlayerProps {
  imdbId: string;
  mediaType: "MOVIE" | "TV";
  season?: number;
  episode?: number;
}

export function Player({ imdbId, mediaType, season, episode }: PlayerProps) {
  const [providerIndex, setProviderIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const provider = EMBED_PROVIDERS[providerIndex];
  const embedUrl = getEmbedUrl(provider, imdbId, mediaType, season, episode);

  const handleSourceChange = useCallback((index: number) => {
    setProviderIndex(index);
    setIframeKey((k) => k + 1); // Force iframe reload
  }, []);

  return (
    <div className="space-y-4">
      {/* Source selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400">Source:</span>
        {EMBED_PROVIDERS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => handleSourceChange(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              i === providerIndex
                ? "bg-brand text-white"
                : "bg-surface-lighter text-gray-300 hover:bg-surface-light hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Player container - sandboxed iframe */}
      <div className="player-wrapper rounded-lg overflow-hidden bg-black ring-1 ring-white/10">
        <iframe
          key={iframeKey}
          src={embedUrl}
          allow="fullscreen; autoplay; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer"
          loading="lazy"
          title="Video Player"
        />
      </div>

      {/* Current source info */}
      <p className="text-xs text-gray-500">
        Playing from <span className="text-gray-400">{provider.name}</span>
        {mediaType === "TV" && season != null && episode != null && (
          <span>
            {" "}
            · Season {season}, Episode {episode}
          </span>
        )}
      </p>
    </div>
  );
}
