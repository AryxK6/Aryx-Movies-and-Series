import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";

interface MediaCardProps {
  id: string;
  title: string;
  posterPath: string;
  mediaType: string;
  voteAverage?: number;
  releaseDate?: string;
}

export function MediaCard({
  id,
  title,
  posterPath,
  mediaType,
  voteAverage,
  releaseDate,
}: MediaCardProps) {
  const year = releaseDate?.split("-")[0];

  return (
    <Link
      href={`/watch/${id}`}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] transition-transform duration-300 hover:scale-105"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-light">
        <Image
          src={posterUrl(posterPath)}
          alt={title}
          fill
          sizes="200px"
          className="object-cover"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        <span className="absolute top-2 left-2 rounded bg-brand/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          {mediaType === "TV" ? "TV" : "Movie"}
        </span>

        {/* Rating */}
        {voteAverage != null && voteAverage > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{voteAverage.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition">
          {title}
        </h3>
        {year && <p className="text-xs text-gray-500">{year}</p>}
      </div>
    </Link>
  );
}
