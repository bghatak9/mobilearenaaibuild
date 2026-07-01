const path = require("path");

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.INTERNAL_API_URL ||
  "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow phone/tablet on LAN to use HMR during dev (e.g. 192.168.x.x:3000).
  allowedDevOrigins: ["192.168.7.117", "192.168.0.0/16", "10.0.0.0/8"],
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