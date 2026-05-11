import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntryEditor } from "@/components/entry-editor";

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  MOVIE: { label: "Movie", emoji: "🎬" },
  TV_SHOW: { label: "TV Show", emoji: "📺" },
  GAME: { label: "Game", emoji: "🎮" },
  BOOK: { label: "Book", emoji: "📚" },
  MUSIC_ALBUM: { label: "Music", emoji: "🎵" },
  PODCAST: { label: "Podcast", emoji: "🎙️" },
};

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const mediaItem = await prisma.mediaItem.findUnique({
    where: { id },
    include: {
      entries: { where: { userId: session.user.id } },
    },
  });

  if (!mediaItem) notFound();

  const entry = mediaItem.entries[0] ?? null;
  const typeInfo = TYPE_LABELS[mediaItem.mediaType] ?? { label: mediaItem.mediaType, emoji: "🎬" };
  const metadata = mediaItem.metadata as Record<string, string | string[] | undefined> | null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <Link href="/" className="text-xl font-semibold tracking-tight">MediaMogul</Link>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex gap-8 flex-col sm:flex-row">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="w-40 h-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
              {mediaItem.coverImage ? (
                <Image
                  src={mediaItem.coverImage}
                  alt={mediaItem.title}
                  width={160}
                  height={224}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-5xl">{typeInfo.emoji}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                {typeInfo.emoji} {typeInfo.label}
              </span>
              {mediaItem.releaseDate && (
                <span className="text-xs text-zinc-500">
                  {mediaItem.releaseDate.getFullYear()}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold">{mediaItem.title}</h1>

            {/* Metadata (director, developer, cast, etc.) */}
            {metadata && (
              <div className="flex flex-col gap-1">
                {metadata.director && (
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-600">Director</span> · {String(metadata.director)}
                  </p>
                )}
                {metadata.developer && (
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-600">Developer</span> · {String(metadata.developer)}
                  </p>
                )}
                {Array.isArray(metadata.cast) && metadata.cast.length > 0 && (
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-600">Cast</span> · {(metadata.cast as string[]).join(", ")}
                  </p>
                )}
                {Array.isArray(metadata.platforms) && metadata.platforms.length > 0 && (
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-600">Platforms</span> · {(metadata.platforms as string[]).join(", ")}
                  </p>
                )}
                {Array.isArray(metadata.genres) && metadata.genres.length > 0 && (
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-600">Genres</span> · {(metadata.genres as string[]).join(", ")}
                  </p>
                )}
              </div>
            )}

            {mediaItem.description && (
              <p className="text-zinc-400 leading-relaxed mt-1">{mediaItem.description}</p>
            )}
          </div>
        </div>

        {/* Tracking section */}
        <div className="mt-10 border-t border-zinc-800 pt-8">
          <h2 className="text-lg font-semibold mb-6">Your tracking</h2>
          {entry ? (
            <EntryEditor
              entryId={entry.id}
              initial={{
                status: entry.status,
                rating: entry.rating,
                notes: entry.notes,
                startedAt: entry.startedAt?.toISOString() ?? null,
                completedAt: entry.completedAt?.toISOString() ?? null,
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400 mb-4">You haven&apos;t tracked this yet.</p>
              <Link
                href={`/search?q=${encodeURIComponent(mediaItem.title)}`}
                className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                + Track this
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
