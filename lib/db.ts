// Re-export the adapter-based Prisma client so legacy API routes
// (app/api/applications/*) don't need to be rewritten.
// Prisma 7 requires the pg Pool adapter — new PrismaClient() without it throws.
export { prisma as db } from "@/lib/prisma";

export const isPlaceholder = false;
