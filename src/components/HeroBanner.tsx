import Image from "next/image";
import Link from "next/link";
import { backdropUrl } from "@/lib/tmdb";
import { Play, Info } from "lucide-react";

interface HeroProps {
  id: string;
  title: string;
  overview: string;
  backdropPath: string;
  mediaType: string;
}

export function HeroBanner({ id, title, overview, backdropPath, mediaType }: HeroProps) {
  return (
    <section className="relative h-[60vh] min-h-[400px] md:h-[75vh] w-full overflow-hidden">
      {/* Backdrop image */}
      {backdropPath && (
        <Image
          src={backdropUrl(backdropPath)}
          alt={title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full px-4 pb-12 md:px-8 md:pb-16 lg:max-w-2xl">
        <span className="mb-3 inline-block rounded bg-brand px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
          {mediaType === "TV" ? "TV Series" : "Movie"}
        </span>
        <h1 className="mb-3 text-3xl font-bold text-white md:text-5xl lg:text-6xl drop-shadow-lg">
          {title}
        </h1>
        <p className="mb-6 line-clamp-3 text-sm text-gray-300 md:text-base">
          {overview}
        </p>

        <div className="flex items-center gap-3">
          <Link
            href={`/watch/${id}`}
            className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200"
          >
            <Play className="h-5 w-5 fill-black" />
            Play
          </Link>
          <Link
            href={`/watch/${id}`}
            className="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Info className="h-5 w-5" />
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
