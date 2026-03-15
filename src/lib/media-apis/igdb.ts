// IGDB (Internet Games Database) API adapter
// Requires a Twitch Developer account for credentials
// Docs: https://api-docs.igdb.com/

const BASE_URL = "https://api.igdb.com/v4";

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`IGDB auth error: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function igdbFetch(endpoint: string, body: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });
  if (!res.ok) throw new Error(`IGDB error: ${res.status}`);
  return res.json();
}

export async function searchGames(query: string) {
  return igdbFetch(
    "games",
    `search "${query}"; fields id,name,summary,cover.url,first_release_date,genres.name,platforms.name; limit 10;`
  );
}

export async function getGame(igdbId: string) {
  return igdbFetch(
    "games",
    `where id = ${igdbId}; fields id,name,summary,cover.url,first_release_date,genres.name,platforms.name,involved_companies.company.name; limit 1;`
  );
}
