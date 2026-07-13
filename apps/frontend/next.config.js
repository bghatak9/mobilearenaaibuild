/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow phone/tablet on LAN to use HMR during dev (e.g. 192.168.x.x:3000).
  allowedDevOrigins: ["192.168.7.117", "192.168.0.0/16", "10.0.0.0/8"],
  // Emit a self-contained server bundle for slim Docker images.
  output: "standalone",
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  // Monorepo: Next is hoisted at the repo root.
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

module.exports = withNextIntl(nextConfig);
