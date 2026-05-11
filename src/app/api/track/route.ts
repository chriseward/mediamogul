import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type MediaType, type MediaStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    externalId,
    mediaType,
    title,
    description,
    coverImage,
    releaseYear,
    status,
    rating,
  }: {
    externalId: string;
    mediaType: MediaType;
    title: string;
    description?: string;
    coverImage?: string;
    releaseYear?: string;
    status: MediaStatus;
    rating?: number;
  } = await req.json();

  // Build the external ID field based on media type
  const externalIdField: Record<string, string | undefined> = {};
  if (mediaType === "MOVIE" || mediaType === "TV_SHOW") externalIdField.tmdbId = externalId;
  else if (mediaType === "GAME") externalIdField.igdbId = externalId;
  else if (mediaType === "BOOK") externalIdField.openLibId = externalId;
  else if (mediaType === "MUSIC_ALBUM") externalIdField.mbId = externalId;

  const releaseDate = releaseYear ? new Date(`${releaseYear}-01-01`) : undefined;

  // Upsert the canonical MediaItem
  const mediaItem = await prisma.mediaItem.upsert({
    where: Object.keys(externalIdField).length
      ? { [`${Object.keys(externalIdField)[0]}_mediaType`]: { [Object.keys(externalIdField)[0]]: externalId, mediaType } } as never
      : { id: "" },
    update: {},
    create: {
      mediaType,
      title,
      description,
      coverImage,
      releaseDate,
      ...externalIdField,
    },
  });

  // Upsert the user's entry
  const entry = await prisma.mediaEntry.upsert({
    where: { userId_mediaItemId: { userId: session.user.id, mediaItemId: mediaItem.id } },
    update: { status, rating: rating ?? null },
    create: {
      userId: session.user.id,
      mediaItemId: mediaItem.id,
      status,
      rating: rating ?? null,
    },
  });

  return NextResponse.json({ entry });
}
