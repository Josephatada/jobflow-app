import { describe, expect, it } from "vitest";
import { byStage, responseRate, topSources } from "@/lib/stats";
import type { ApplicationView } from "@/lib/types";

function app(overrides: Partial<ApplicationView>): ApplicationView {
  return {
    id: "app-1",
    company: "Acme",
    roleTitle: "Engineer",
    jobUrl: null,
    location: null,
    source: "linkedin",
    dateApplied: null,
    contactName: null,
    contactEmail: null,
    salaryRange: null,
    stage: "applied",
    followUpDate: null,
    isStarred: false,
    notes: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    interviewRounds: [],
    ...overrides,
  };
}

describe("stats helpers", () => {
  it("groups applications by stage", () => {
    const result = byStage([
      app({ id: "a", stage: "applied" }),
      app({ id: "b", stage: "interview" }),
      app({ id: "c", stage: "interview" }),
    ]);

    expect(result.find((stage) => stage.slug === "applied")?.value).toBe(1);
    expect(result.find((stage) => stage.slug === "interview")?.value).toBe(2);
  });

  it("calculates response rate from applied-or-beyond applications", () => {
    expect(responseRate([
      app({ id: "a", stage: "applied" }),
      app({ id: "b", stage: "interview" }),
      app({ id: "c", stage: "rejected" }),
      app({ id: "d", stage: "wishlist" }),
    ])).toBe(67);
  });

  it("counts source performance", () => {
    const result = topSources([
      app({ id: "a", source: "linkedin", stage: "applied" }),
      app({ id: "b", source: "linkedin", stage: "interview" }),
      app({ id: "c", source: "referral", stage: "offer" }),
    ]);

    expect(result[0]).toMatchObject({ source: "linkedin", applied: 2, interview: 1 });
    expect(result[1]).toMatchObject({ source: "referral", applied: 1, interview: 1 });
  });
});
