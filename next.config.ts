import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling Prisma and its pg adapter.
  // These use native Node.js internals that must be loaded directly
  // from node_modules, not inlined into the server bundle.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
