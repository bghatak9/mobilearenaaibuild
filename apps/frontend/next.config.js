const path = require("path");

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.INTERNAL_API_URL ||
  "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for slim Docker images.
  output: "standalone",
  // Monorepo: resolve deps from this app, not the repo root lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;