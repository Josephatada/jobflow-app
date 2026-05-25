import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling Prisma and its pg adapter.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Next.js 15 defaults to 0s router-cache TTL for dynamic pages (any page
    // that reads cookies/headers). That means every tab switch re-fetches the
    // server component even if you just visited it. Setting dynamic to 30s
    // keeps already-loaded pages in the client-side router cache so switching
    // between Board / Summary / Stats / Settings is instant after first load.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
