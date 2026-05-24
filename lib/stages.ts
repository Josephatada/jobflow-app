import type { Stage } from "@prisma/client";

export const STAGES: { slug: Stage; label: string; color: string; dot: string }[] = [
  { slug: "wishlist",  label: "Saved",     color: "text-gray-600",  dot: "bg-gray-400" },
  { slug: "applied",   label: "Applied",   color: "text-blue-600",  dot: "bg-blue-400" },
  { slug: "interview", label: "Interview", color: "text-orange-600", dot: "bg-orange-400" },
  { slug: "offer",     label: "Offer",     color: "text-green-600", dot: "bg-green-400" },
  { slug: "rejected",  label: "Rejected",  color: "text-red-600",   dot: "bg-red-400" },
  { slug: "ghosted",   label: "Ghosted",   color: "text-gray-500",  dot: "bg-gray-300" },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.slug, s])) as Record<Stage, typeof STAGES[number]>;
