"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Search, Menu, X } from "lucide-react";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMobileOpen(false);
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-brand font-bold text-2xl">
          <Film className="h-7 w-7" />
          <span>Aryx Movies and Series</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-300 hover:text-white transition">
            Home
          </Link>
          <Link href="/search?type=MOVIE" className="text-sm text-gray-300 hover:text-white transition">
            Movies
          </Link>
          <Link href="/search?type=TV" className="text-sm text-gray-300 hover:text-white transition">
            TV Shows
          </Link>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-full bg-surface-lighter/80 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-white/10 focus:ring-brand transition"
            />
          </form>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-300 hover:text-white"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 px-4 py-4 space-y-4">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">
            Home
          </Link>
          <Link href="/search?type=MOVIE" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">
            Movies
          </Link>
          <Link href="/search?type=TV" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">
            TV Shows
          </Link>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full bg-surface-lighter/80 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-white/10 focus:ring-brand"
            />
          </form>
        </div>
      )}
    </nav>
  );
}
