import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type MediaType, type MediaStatus } from "@prisma/client";
import { SignOutButton } from "@/components/sign-out-button";

const MEDIA_TYPE_LABELS: Record<MediaType, { label: string; emoji: string }> = {
  MOVIE: { label: "Movies", emoji: "🎬" },
  TV_SHOW: { label: "TV Shows", emoji: "📺" },
  GAME: { label: "Games", emoji: "🎮" },
  BOOK: { label: "Books", emoji: "📚" },
  MUSIC_ALBUM: { label: "Music", emoji: "🎵" },
  PODCAST: { label: "Podcasts", emoji: "🎙️" },
};

const STATUS_LABELS: Record<MediaStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  ON_HOLD: "On Hold",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [recentEntries, countsByStatus, totalCount] = await Promise.all([
    prisma.mediaEntry.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { mediaItem: true },
    }),
    prisma.mediaEntry.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.mediaEntry.count({ where: { userId } }),
  ]);

  // Count by media type via a join
  const entriesWithTypes = await prisma.mediaEntry.findMany({
    where: { userId },
    select: { mediaItem: { select: { mediaType: true } } },
  });

  const typeCounts = entriesWithTypes.reduce<Record<string, number>>((acc: Record<string, number>, e: { mediaItem: { mediaType: MediaType } }) => {
    const t = e.mediaItem.mediaType;
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  const statusCounts = countsByStatus.reduce<Record<string, number>>((acc: Record<string, number>, g: { status: MediaStatus; _count: number }) => {
    acc[g.status] = g._count;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          MediaMogul
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-zinc-400">{session.user.name ?? session.user.email}</span>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">{totalCount} items tracked</p>
        </div>

        {/* Stats by media type */}
        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">By Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {(Object.keys(MEDIA_TYPE_LABELS) as MediaType[]).map((type) => (
              <div key={type} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-2xl">{MEDIA_TYPE_LABELS[type].emoji}</span>
                <span className="text-xl font-bold">{typeCounts[type] ?? 0}</span>
                <span className="text-xs text-zinc-500">{MEDIA_TYPE_LABELS[type].label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats by status */}
        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">By Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.keys(STATUS_LABELS) as MediaStatus[]).map((status) => (
              <div key={status} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xl font-bold">{statusCounts[status] ?? 0}</span>
                <span className="text-xs text-zinc-500">{STATUS_LABELS[status]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Recent Activity</h2>
          {recentEntries.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-400 mb-4">Nothing tracked yet.</p>
              <Link
                href="/search"
                className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                Find something to track
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{MEDIA_TYPE_LABELS[entry.mediaItem.mediaType].emoji}</span>
                    <div>
                      <p className="font-medium">{entry.mediaItem.title}</p>
                      <p className="text-xs text-zinc-500">{MEDIA_TYPE_LABELS[entry.mediaItem.mediaType].label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.rating != null && (
                      <span className="text-sm text-zinc-300">{entry.rating}/10</span>
                    )}
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
