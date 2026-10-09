"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaCard } from "@/components/MediaCard";
import { Search, Loader2 } from "lucide-react";

interface MediaResult {
  id: string;
  title: string;
  posterPath: string;
  mediaType: string;
  voteAverage: number;
  releaseDate: string;
  overview: string;
}

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "";

  const [query, setQuery] = useState(initialQuery);

  // Keep the input in sync when the URL changes (e.g. navbar search)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery || typeFilter) {
      performSearch(initialQuery, typeFilter);
    } else {
      setResults([]);
      setSearched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, typeFilter]);

  async function performSearch(q: string, type?: string) {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type) params.set("type", type);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Updating the URL triggers the effect above, which runs the search
  function updateUrl(q: string, type: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("type", type);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl(query, typeFilter);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl bg-surface-lighter px-12 py-4 text-white placeholder-gray-500 outline-none ring-1 ring-white/10 focus:ring-brand text-lg transition"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand animate-spin" />
          )}
        </div>
      </form>

      {/* Type filters */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-gray-500">Filter:</span>
        {[
          { label: "All", value: "" },
          { label: "Movies", value: "MOVIE" },
          { label: "TV Shows", value: "TV" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => updateUrl(query, filter.value)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              typeFilter === filter.value
                ? "bg-brand text-white"
                : "bg-surface-lighter text-gray-300 hover:bg-surface-light"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results heading */}
      {searched && !loading && (
        <p className="mb-6 text-sm text-gray-400">
          {results.length} result{results.length !== 1 ? "s" : ""}
          {initialQuery && ` for "${initialQuery}"`}
        </p>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] animate-pulse rounded-lg bg-surface-lighter" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-lighter" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.title}
              posterPath={item.posterPath}
              mediaType={item.mediaType}
              voteAverage={item.voteAverage}
              releaseDate={item.releaseDate}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-400">No results found.</p>
          <p className="mt-2 text-sm text-gray-500">
            Try a different search term or check your spelling.
          </p>
        </div>
      )}
    </div>
  );
}
