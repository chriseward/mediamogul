// MusicBrainz API adapter (music albums)
// Free, no API key required — please set a descriptive User-Agent
// Docs: https://musicbrainz.org/doc/MusicBrainz_API

const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "MediaMogul/0.1 (https://github.com/yourusername/mediamogul)";

async function mbFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}&fmt=json`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`MusicBrainz error: ${res.status}`);
  return res.json();
}

export async function searchAlbums(query: string) {
  return mbFetch(`/release-group?query=${encodeURIComponent(query)}&type=album&limit=10`);
}

export async function getAlbum(mbId: string) {
  return mbFetch(`/release-group/${mbId}?inc=artists+releases`);
}
