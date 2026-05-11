import { NextResponse } from "next/server";
import { searchMulti, posterUrl } from "@/lib/media-apis/tmdb";
import { searchGames } from "@/lib/media-apis/igdb";
import { searchBooks, coverUrl as bookCoverUrl } from "@/lib/media-apis/openlibrary";
import { searchAlbums } from "@/lib/media-apis/musicbrainz";
import { prisma } from "@/lib/prisma";
import { type MediaType } from "@prisma/client";

export type SearchResultItem = {
  externalId: string;
  title: string;
  description?: string;
  coverImage?: string;
  releaseYear?: string;
  mediaType: "MOVIE" | "TV_SHOW" | "GAME" | "BOOK" | "MUSIC_ALBUM" | "PODCAST";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? "ALL";

  if (!q) return NextResponse.json({ results: [] });

  const results: SearchResultItem[] = [];

  // Search local DB first
  const typeFilter = type === "ALL" ? undefined : type as MediaType;
  const localItems = await prisma.mediaItem.findMany({
    where: {
      title: { contains: q, mode: "insensitive" },
      ...(typeFilter ? { mediaType: typeFilter } : {}),
    },
    take: 20,
  });
  for (const item of localItems) {
    const extId = item.tmdbId ?? item.igdbId ?? item.openLibId ?? item.mbId ?? item.id;
    results.push({
      externalId: extId,
      title: item.title,
      description: item.description ?? undefined,
      coverImage: item.coverImage ?? undefined,
      releaseYear: item.releaseDate?.getFullYear().toString(),
      mediaType: item.mediaType as SearchResultItem["mediaType"],
    });
  }

  try {
    // Movies + TV via TMDB
    if (["ALL", "MOVIE", "TV_SHOW"].includes(type) && process.env.TMDB_API_READ_TOKEN) {
      const tmdb = await searchMulti(q).catch(() => ({ results: [] }));
      for (const r of tmdb.results ?? []) {
        if (r.media_type === "movie" && ["ALL", "MOVIE"].includes(type)) {
          results.push({
            externalId: String(r.id),
            title: r.title ?? r.name ?? "",
            description: r.overview,
            coverImage: posterUrl(r.poster_path) ?? undefined,
            releaseYear: r.release_date?.slice(0, 4),
            mediaType: "MOVIE",
          });
        } else if (r.media_type === "tv" && ["ALL", "TV_SHOW"].includes(type)) {
          results.push({
            externalId: String(r.id),
            title: r.name ?? r.title ?? "",
            description: r.overview,
            coverImage: posterUrl(r.poster_path) ?? undefined,
            releaseYear: r.first_air_date?.slice(0, 4),
            mediaType: "TV_SHOW",
          });
        }
      }
    }

    // Games via IGDB
    if (["ALL", "GAME"].includes(type) && process.env.IGDB_CLIENT_ID) {
      const games = await searchGames(q).catch(() => []);
      for (const g of games ?? []) {
        results.push({
          externalId: String(g.id),
          title: g.name,
          description: g.summary,
          coverImage: g.cover?.url ? `https:${g.cover.url.replace("t_thumb", "t_cover_big")}` : undefined,
          releaseYear: g.first_release_date
            ? new Date(g.first_release_date * 1000).getFullYear().toString()
            : undefined,
          mediaType: "GAME",
        });
      }
    }

    // Books via Open Library
    if (["ALL", "BOOK"].includes(type)) {
      const books = await searchBooks(q).catch(() => ({ docs: [] }));
      for (const b of (books.docs ?? []).slice(0, 10)) {
        results.push({
          externalId: b.key?.replace("/works/", "") ?? "",
          title: b.title,
          description: b.author_name?.join(", "),
          coverImage: b.cover_i ? bookCoverUrl(b.cover_i, "M") : undefined,
          releaseYear: b.first_publish_year?.toString(),
          mediaType: "BOOK",
        });
      }
    }

    // Music via MusicBrainz
    if (["ALL", "MUSIC_ALBUM"].includes(type)) {
      const albums = await searchAlbums(q).catch(() => ({ "release-groups": [] }));
      for (const a of (albums["release-groups"] ?? []).slice(0, 10)) {
        results.push({
          externalId: a.id,
          title: a.title,
          description: a["artist-credit"]?.map((ac: { name?: string; artist?: { name: string } }) => ac.name ?? ac.artist?.name).join(", "),
          releaseYear: a["first-release-date"]?.slice(0, 4),
          mediaType: "MUSIC_ALBUM",
        });
      }
    }
  } catch (err) {
    console.error("Search error:", err);
  }

  return NextResponse.json({ results });
}
