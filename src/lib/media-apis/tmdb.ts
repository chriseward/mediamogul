// The Movie Database (TMDB) API adapter
// Handles movies and TV shows
// Docs: https://developers.themoviedb.org/3

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function headers() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export type TmdbSearchResult = {
  id: number;
  title?: string; // movies
  name?: string; // TV
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
};

export async function searchMulti(query: string, page = 1) {
  const res = await fetch(
    `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json() as Promise<{ results: TmdbSearchResult[]; total_pages: number }>;
}

export async function getMovie(tmdbId: string) {
  const res = await fetch(
    `${BASE_URL}/movie/${tmdbId}?append_to_response=credits,videos`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function getTvShow(tmdbId: string) {
  const res = await fetch(
    `${BASE_URL}/tv/${tmdbId}?append_to_response=credits,videos`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export function posterUrl(path: string | null) {
  if (!path) return null;
  return `${IMAGE_BASE}${path}`;
}
