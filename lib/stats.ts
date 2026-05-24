import type { ApplicationView } from "./types";
import { STAGES } from "./stages";

export type DateRange = "30d" | "90d" | "all";

function cutoff(range: DateRange): number {
  const now = Date.now();
  if (range === "30d") return now - 30 * 86400000;
  if (range === "90d") return now - 90 * 86400000;
  return 0;
}

export function filterByRange(apps: ApplicationView[], range: DateRange): ApplicationView[] {
  const c = cutoff(range);
  return c ? apps.filter((a) => new Date(a.createdAt).getTime() >= c) : apps;
}

export function byStage(apps: ApplicationView[]) {
  return STAGES.map((s) => ({
    name: s.label,
    slug: s.slug,
    value: apps.filter((a) => a.stage === s.slug).length,
    color: STAGE_COLORS[s.slug],
  })).filter((s) => s.value > 0);
}

const STAGE_COLORS: Record<string, string> = {
  wishlist:  "#9ca3af",
  applied:   "#60a5fa",
  interview: "#fb923c",
  offer:     "#4ade80",
  rejected:  "#f87171",
  ghosted:   "#d1d5db",
};

export function responseRate(apps: ApplicationView[]): number {
  const applied = apps.filter((a) =>
    ["applied", "interview", "offer", "rejected", "ghosted"].includes(a.stage)
  ).length;
  if (!applied) return 0;
  const responded = apps.filter((a) =>
    ["interview", "offer", "rejected"].includes(a.stage)
  ).length;
  return Math.round((responded / applied) * 100);
}

export function weeklyVolume(apps: ApplicationView[]) {
  const weeks: Record<string, number> = {};
  apps.forEach((a) => {
    const d = new Date(a.createdAt);
    // Round down to Monday
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const key = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weeks[key] = (weeks[key] ?? 0) + 1;
  });
  return Object.entries(weeks)
    .map(([week, count]) => ({ week, count }))
    .slice(-10);
}

export function topSources(apps: ApplicationView[]) {
  const counts: Record<string, { applied: number; interview: number }> = {};
  apps.forEach((a) => {
    const s = a.source ?? "other";
    if (!counts[s]) counts[s] = { applied: 0, interview: 0 };
    counts[s].applied++;
    if (["interview", "offer"].includes(a.stage)) counts[s].interview++;
  });
  return Object.entries(counts)
    .map(([source, v]) => ({ source: source.replace("_", " "), ...v }))
    .sort((a, b) => b.applied - a.applied);
}

export function funnel(apps: ApplicationView[]) {
  const stages = ["applied", "interview", "offer"] as const;
  return stages.map((s) => ({
    name: STAGES.find((st) => st.slug === s)!.label,
    value: apps.filter((a) =>
      s === "applied"
        ? ["applied", "interview", "offer", "rejected", "ghosted"].includes(a.stage)
        : a.stage === s
    ).length,
  }));
}

export function avgDaysInStage(apps: ApplicationView[]): { stage: string; days: number }[] {
  // Approximate: use updatedAt - createdAt for apps that moved past a stage
  const moved = apps.filter((a) =>
    ["interview", "offer", "rejected", "ghosted"].includes(a.stage) && a.dateApplied
  );
  if (!moved.length) return [];
  const totalDays =
    moved.reduce((sum, a) => {
      const applied = new Date(a.dateApplied!).getTime();
      const updated = new Date(a.updatedAt).getTime();
      return sum + (updated - applied) / 86400000;
    }, 0) / moved.length;

  return [{ stage: "Applied → Next stage", days: Math.round(totalDays) }];
}
