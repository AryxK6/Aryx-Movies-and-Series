/**
 * Embed Provider Configuration
 *
 * Maps IMDb/TMDB IDs to embed URLs from multiple free providers.
 * Provides fallback switching so if one source is down, users can try another.
 */

export interface EmbedProvider {
  name: string;
  buildMovieUrl: (imdbId: string) => string;
  buildTVUrl: (imdbId: string, season: number, episode: number) => string;
}

export const EMBED_PROVIDERS: EmbedProvider[] = [
  {
    name: "Server 1 (VidSrc)",
    buildMovieUrl: (imdbId) => `https://vidsrc.to/embed/movie/${imdbId}`,
    buildTVUrl: (imdbId, season, episode) =>
      `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`,
  },
  {
    name: "Server 2 (VidSrc.xyz)",
    buildMovieUrl: (imdbId) => `https://vidsrc.xyz/embed/movie/${imdbId}`,
    buildTVUrl: (imdbId, season, episode) =>
      `https://vidsrc.xyz/embed/tv/${imdbId}/${season}/${episode}`,
  },
  {
    name: "Server 3 (2Embed)",
    buildMovieUrl: (imdbId) => `https://www.2embed.cc/embed/${imdbId}`,
    buildTVUrl: (imdbId, season, episode) =>
      `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}`,
  },
  {
    name: "Server 4 (AutoEmbed)",
    buildMovieUrl: (imdbId) => `https://autoembed.co/movie/imdb/${imdbId}`,
    buildTVUrl: (imdbId, season, episode) =>
      `https://autoembed.co/tv/imdb/${imdbId}-${season}-${episode}`,
  },
  {
    name: "Server 5 (MultiEmbed)",
    buildMovieUrl: (imdbId) =>
      `https://multiembed.mov/?video_id=${imdbId}&tmdb=1`,
    buildTVUrl: (imdbId, season, episode) =>
      `https://multiembed.mov/?video_id=${imdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
];

export function getEmbedUrl(
  provider: EmbedProvider,
  imdbId: string,
  mediaType: "MOVIE" | "TV",
  season?: number,
  episode?: number
): string {
  if (mediaType === "TV" && season != null && episode != null) {
    return provider.buildTVUrl(imdbId, season, episode);
  }
  return provider.buildMovieUrl(imdbId);
}
