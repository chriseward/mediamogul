// Open Library API adapter (books)
// Free, no API key required
// Docs: https://openlibrary.org/developers/api

const BASE_URL = "https://openlibrary.org";

export async function searchBooks(query: string) {
  const res = await fetch(
    `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,cover_i,first_publish_year,subject`
  );
  if (!res.ok) throw new Error(`OpenLibrary error: ${res.status}`);
  return res.json();
}

export async function getBook(openLibId: string) {
  const res = await fetch(`${BASE_URL}/works/${openLibId}.json`);
  if (!res.ok) throw new Error(`OpenLibrary error: ${res.status}`);
  return res.json();
}

export function coverUrl(coverId: number, size: "S" | "M" | "L" = "M") {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
