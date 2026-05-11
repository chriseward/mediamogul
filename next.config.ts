import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "image.tmdb.org" },
      { hostname: "images.igdb.com" },
      { hostname: "covers.openlibrary.org" },
      { hostname: "coverartarchive.org" },
      { hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
