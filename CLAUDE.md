# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**MediaMogul** — A self-hostable media tracking app (movies, TV, games, books, music, podcasts). Think Letterboxd for all media types.

## Commands

```bash
# Requires Node 20+ (use nvm: source ~/.nvm/nvm.sh && nvm use 20)

npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma migrate deploy              # Apply migrations (production)
npx prisma studio                      # Visual DB browser
npx prisma generate                    # Regenerate Prisma client after schema changes

docker compose up --build              # Full stack (app + postgres)
docker compose up db                   # Postgres only (for local dev)
```

## Architecture

**Stack:** Next.js 16 (App Router) · TypeScript · Prisma · PostgreSQL · NextAuth v5 · Tailwind CSS

**Key principle:** Same codebase runs self-hosted (Docker Compose on a Raspberry Pi) and as SaaS (Vercel + managed Postgres). Only the `.env` differs between environments.

### Data model (`prisma/schema.prisma`)

- `User` — accounts, with optional `passwordHash` for credentials auth and `username` for public profiles
- `MediaItem` — canonical media records cached from external APIs; `mediaType` enum discriminates MOVIE / TV_SHOW / GAME / BOOK / MUSIC_ALBUM / PODCAST; external IDs (`tmdbId`, `igdbId`, `openLibId`, `mbId`) link back to source APIs; `metadata` JSON stores type-specific fields
- `MediaEntry` — a user's tracking record for one `MediaItem` (status, rating 0–10, progress, dates)
- `Review` — long-form written reviews, separate from the quick rating on `MediaEntry`
- `MediaList` — user-curated ordered lists of media
- `Follow` — social graph between users

### Auth (`src/lib/auth.ts`)

NextAuth v5 with JWT sessions. Supports credentials (email + bcrypt), Google, and GitHub. The `session.user.id` is populated via the JWT callback so it's available in Server Components via `auth()`.

### Media API adapters (`src/lib/media-apis/`)

Each file wraps one external API:
- `tmdb.ts` — TMDB for movies & TV (requires `TMDB_API_READ_TOKEN`)
- `igdb.ts` — IGDB/Twitch for games (requires `IGDB_CLIENT_ID` + `IGDB_CLIENT_SECRET`; fetches a fresh access token per request — add caching before production)
- `openlibrary.ts` — Open Library for books (no API key)
- `musicbrainz.ts` — MusicBrainz for albums (no API key)

The pattern for adding a new media type: add the enum value to `MediaType` in the schema, create an adapter in `media-apis/`, and add an import handler to whichever search/import flow calls the adapters.

### Environment variables

See `.env.example`. Required for basic operation: `DATABASE_URL`, `AUTH_SECRET`. Media APIs are optional but degrade gracefully to empty results if tokens are missing.
