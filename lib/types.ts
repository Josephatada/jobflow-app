import type { Source, Stage } from "@prisma/client";

export type InterviewRoundView = {
  id: string;
  applicationId: string;
  label: string;
  date: string | null;
  createdAt: string;
};

export type ApplicationView = {
  id: string;
  company: string;
  roleTitle: string;
  jobUrl: string | null;
  location: string | null;
  source: Source | null;
  dateApplied: string | null;
  contactName: string | null;
  contactEmail: string | null;
  salaryRange: string | null;
  stage: Stage;
  followUpDate: string | null;
  isStarred: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  interviewRounds: InterviewRoundView[];
};

export type UserSettingsView = {
  ghostThresholdDays: number;
  emailDigestEnabled: boolean;
};

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };
