"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SearchResultItem } from "@/app/api/search/route";

const TYPES = [
  { value: "ALL", label: "All" },
  { value: "MOVIE", label: "Movies", emoji: "🎬" },
  { value: "TV_SHOW", label: "TV Shows", emoji: "📺" },
  { value: "GAME", label: "Games", emoji: "🎮" },
  { value: "BOOK", label: "Books", emoji: "📚" },
  { value: "MUSIC_ALBUM", label: "Music", emoji: "🎵" },
];

const STATUSES = [
  { value: "PLANNED", label: "Plan to watch" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "DROPPED", label: "Dropped" },
];

const TYPE_EMOJI: Record<string, string> = {
  MOVIE: "🎬", TV_SHOW: "📺", GAME: "🎮", BOOK: "📚", MUSIC_ALBUM: "🎵", PODCAST: "🎙️",
};

function TrackButton({ item }: { item: SearchResultItem }) {
  const [open, setOpen] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function track(status: string) {
    setLoading(true);
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status }),
    });
    setLoading(false);
    setTracked(true);
    setOpen(false);
  }

  if (tracked) {
    return (
      <span className="text-xs text-green-400 font-medium px-3 py-1.5 rounded-full border border-green-800 bg-green-950">
        Tracked
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="text-xs font-medium bg-white text-black px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        + Track
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl min-w-[160px]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => track(s.value)}
              className="w-full text-left text-sm px-4 py-2.5 hover:bg-zinc-800 transition-colors text-zinc-200"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string, t: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${t}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q, type), 500);
  }

  function handleTypeChange(t: string) {
    setType(t);
    if (query.trim()) search(query, t);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <Link href="/" className="text-xl font-semibold tracking-tight">MediaMogul</Link>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Dashboard
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Search</h1>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search movies, games, books, music..."
          autoFocus
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-lg"
        />

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                type === t.value
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {t.emoji ? `${t.emoji} ${t.label}` : t.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && (
          <div className="text-zinc-500 text-sm py-8 text-center">Searching...</div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-zinc-500 text-sm py-8 text-center">No results found.</div>
        )}

        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-3">
            {results.map((item, i) => (
              <div
                key={`${item.mediaType}-${item.externalId}-${i}`}
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                {/* Cover */}
                <div className="w-12 h-16 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      width={48}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl">{TYPE_EMOJI[item.mediaType] ?? "🎬"}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {TYPE_EMOJI[item.mediaType]} {item.mediaType.replace("_", " ")}
                    {item.releaseYear ? ` · ${item.releaseYear}` : ""}
                  </p>
                  {item.description && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>

                {/* Track button */}
                <TrackButton item={item} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
