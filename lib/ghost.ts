import { daysSince } from "@/lib/utils";
import type { ApplicationView } from "@/lib/types";

export function getGhostSuggestions(
  applications: ApplicationView[],
  thresholdDays: number,
  snoozedIds: Set<string>
) {
  return applications.filter(
    (app) =>
      (app.stage === "applied" || app.stage === "interview") &&
      daysSince(app.updatedAt) >= thresholdDays &&
      !snoozedIds.has(app.id)
  );
}
