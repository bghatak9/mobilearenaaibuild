/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for slim Docker images.
  output: "standalone",
  transpilePackages: ["@mobilearena/ui"],
};

module.exports = nextConfig;