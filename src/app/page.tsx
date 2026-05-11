import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const mediaTypes = [
  { emoji: "🎬", label: "Movies" },
  { emoji: "📺", label: "TV Shows" },
  { emoji: "🎮", label: "Games" },
  { emoji: "📚", label: "Books" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🎙️", label: "Podcasts" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-xl font-semibold tracking-tight">MediaMogul</span>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </a>
          <a
            href="/register"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-8">
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight leading-tight max-w-3xl">
          All your media,{" "}
          <span className="text-zinc-500">belong to</span>{" "}
          <span className="text-zinc-400">you.</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Track, rate, and review everything you watch, play, read, and listen to.
          <br />
          Like Letterboxd — but for every kind of media.
        </p>

        <div className="flex items-center gap-4 mt-2">
          <a
            href="/register"
            className="bg-white text-black font-medium px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Start for free
          </a>
          <a
            href="/login"
            className="border border-zinc-700 text-white font-medium px-6 py-3 rounded-full hover:border-zinc-500 transition-colors"
          >
            Sign in
          </a>
        </div>

        {/* Media type pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {mediaTypes.map(({ emoji, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium px-4 py-2 rounded-full"
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
