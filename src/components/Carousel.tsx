"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";

interface MediaItem {
  id: string;
  title: string;
  posterPath: string;
  mediaType: string;
  voteAverage?: number;
  releaseDate?: string;
}

interface CarouselProps {
  title: string;
  items: MediaItem[];
}

export function Carousel({ title, items }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="relative px-4 md:px-8">
      <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
        {title}
      </h2>

      <div className="group relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-brand"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="carousel-scroll flex gap-3 overflow-x-auto scroll-smooth pb-4"
        >
          {items.map((item) => (
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

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-brand"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
