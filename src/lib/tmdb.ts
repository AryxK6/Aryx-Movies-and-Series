/**
 * TMDB API Client
 *
 * Handles all communication with The Movie Database API including:
 * - Fetching trending content
 * - Now playing movies
 * - Popular TV shows
 * - External IDs (IMDb)
 * - Search
 * - TV season/episode details
 */

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  const key = getApiKey();
  // v4 read-access tokens are JWTs (start with "eyJ"); v3 keys are 32-char hex
  const isV4Token = key.startsWith("eyJ");
  if (!isV4Token) url.searchParams.set("api_key", key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: isV4Token ? { Authorization: `Bearer ${key}` } : undefined,
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
}

interface TMDBListResponse {
  page: number;
  results: TMDBResult[];
  total_pages: number;
  total_results: number;
}

interface TMDBExternalIds {
  imdb_id: string | null;
}

export interface TMDBSeason {
  season_number: number;
  episode_count: number;
  name: string;
  air_date: string | null;
}

export interface TMDBEpisode {
  episode_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
}

interface TMDBSeasonDetail {
  episodes: TMDBEpisode[];
}

interface TMDBTVDetail {
  id: number;
  seasons: TMDBSeason[];
}

// ── Public API ─────────────────────────────────────────

/** Fetch trending movies and TV shows (day window) */
export async function fetchTrending(page = 1): Promise<TMDBResult[]> {
  const data = await tmdbFetch<TMDBListResponse>("/trending/all/day", {
    page: String(page),
  });
  return data.results;
}

/** Fetch now-playing movies */
export async function fetchNowPlaying(page = 1): Promise<TMDBResult[]> {
  const data = await tmdbFetch<TMDBListResponse>("/movie/now_playing", {
    page: String(page),
  });
  // Normalize: add media_type since this endpoint doesn't include it
  return data.results.map((r) => ({ ...r, media_type: "movie" }));
}

/** Fetch popular TV shows */
export async function fetchPopularTV(page = 1): Promise<TMDBResult[]> {
  const data = await tmdbFetch<TMDBListResponse>("/tv/popular", {
    page: String(page),
  });
  return data.results.map((r) => ({ ...r, media_type: "tv" }));
}

/** Get external IDs (IMDb ID) for a movie or TV show */
export async function fetchExternalIds(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<string | null> {
  try {
    const data = await tmdbFetch<TMDBExternalIds>(
      `/${mediaType}/${tmdbId}/external_ids`
    );
    return data.imdb_id ?? null;
  } catch {
    return null;
  }
}

/** Search TMDB for movies and TV shows */
export async function searchTMDB(query: string): Promise<TMDBResult[]> {
  const data = await tmdbFetch<TMDBListResponse>("/search/multi", {
    query,
    include_adult: "false",
  });
  // Filter to only movie and tv results
  return data.results.filter(
    (r) => r.media_type === "movie" || r.media_type === "tv"
  );
}

/** Fetch TV show details (seasons list) */
export async function fetchTVDetails(tmdbId: number): Promise<TMDBSeason[]> {
  const data = await tmdbFetch<TMDBTVDetail>(`/tv/${tmdbId}`);
  // Filter out "Specials" (season 0) unless it's the only season
  return data.seasons.filter(
    (s) => s.season_number > 0 || data.seasons.length === 1
  );
}

/** Fetch episodes for a specific TV season */
export async function fetchSeasonEpisodes(
  tmdbId: number,
  seasonNumber: number
): Promise<TMDBEpisode[]> {
  const data = await tmdbFetch<TMDBSeasonDetail>(
    `/tv/${tmdbId}/season/${seasonNumber}`
  );
  return data.episodes;
}

// ── Image Helpers ──────────────────────────────────────

export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "/no-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280"): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// ── Normalization ──────────────────────────────────────

export function normalizeTitle(result: TMDBResult): string {
  return result.title || result.name || "Untitled";
}

export function normalizeReleaseDate(result: TMDBResult): string {
  return result.release_date || result.first_air_date || "";
}

export function normalizeMediaType(result: TMDBResult): "MOVIE" | "TV" {
  return result.media_type === "tv" ? "TV" : "MOVIE";
}
