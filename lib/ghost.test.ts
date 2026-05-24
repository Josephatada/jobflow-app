import { describe, expect, it, vi } from "vitest";
import { getGhostSuggestions } from "@/lib/ghost";
import type { ApplicationView } from "@/lib/types";

function app(overrides: Partial<ApplicationView>): ApplicationView {
  const now = new Date("2026-05-24T12:00:00.000Z").toISOString();
  return {
    id: "app-1",
    company: "Acme",
    roleTitle: "Engineer",
    jobUrl: null,
    location: null,
    source: null,
    dateApplied: null,
    contactName: null,
    contactEmail: null,
    salaryRange: null,
    stage: "applied",
    followUpDate: null,
    isStarred: false,
    notes: null,
    createdAt: now,
    updatedAt: now,
    interviewRounds: [],
    ...overrides,
  };
}

describe("getGhostSuggestions", () => {
  it("returns stale applied and interview applications only", () => {
    vi.setSystemTime(new Date("2026-05-24T12:00:00.000Z"));
    const stale = new Date("2026-05-01T12:00:00.000Z").toISOString();
    const fresh = new Date("2026-05-20T12:00:00.000Z").toISOString();

    const result = getGhostSuggestions(
      [
        app({ id: "applied", stage: "applied", updatedAt: stale }),
        app({ id: "interview", stage: "interview", updatedAt: stale }),
        app({ id: "fresh", stage: "applied", updatedAt: fresh }),
        app({ id: "offer", stage: "offer", updatedAt: stale }),
      ],
      14,
      new Set()
    );

    expect(result.map((item) => item.id)).toEqual(["applied", "interview"]);
    vi.useRealTimers();
  });

  it("excludes snoozed applications", () => {
    vi.setSystemTime(new Date("2026-05-24T12:00:00.000Z"));
    const stale = new Date("2026-05-01T12:00:00.000Z").toISOString();

    const result = getGhostSuggestions(
      [app({ id: "snoozed", updatedAt: stale }), app({ id: "visible", updatedAt: stale })],
      14,
      new Set(["snoozed"])
    );

    expect(result.map((item) => item.id)).toEqual(["visible"]);
    vi.useRealTimers();
  });
});
