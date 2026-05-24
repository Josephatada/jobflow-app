import { prisma } from "@/lib/prisma";
import type { Application, InterviewRound, UserSettings } from "@prisma/client";
import type { ApplicationView, InterviewRoundView, UserSettingsView } from "@/lib/types";

type ApplicationWithRounds = Application & { interviewRounds: InterviewRound[] };

function iso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export function serializeRound(round: InterviewRound): InterviewRoundView {
  return {
    id: round.id,
    applicationId: round.applicationId,
    label: round.label,
    date: iso(round.date),
    createdAt: round.createdAt.toISOString(),
  };
}

export function serializeApplication(app: ApplicationWithRounds): ApplicationView {
  return {
    id: app.id,
    company: app.company,
    roleTitle: app.roleTitle,
    jobUrl: app.jobUrl,
    location: app.location,
    source: app.source,
    dateApplied: iso(app.dateApplied),
    contactName: app.contactName,
    contactEmail: app.contactEmail,
    salaryRange: app.salaryRange,
    stage: app.stage,
    followUpDate: iso(app.followUpDate),
    isStarred: app.isStarred,
    notes: app.notes,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    interviewRounds: app.interviewRounds.map(serializeRound),
  };
}

export function serializeSettings(settings: UserSettings): UserSettingsView {
  return {
    ghostThresholdDays: settings.ghostThresholdDays,
    emailDigestEnabled: settings.emailDigestEnabled,
  };
}

export async function getApplicationsForUser(userId: string): Promise<ApplicationView[]> {
  const apps = await prisma.application.findMany({
    where: { userId },
    include: { interviewRounds: { orderBy: { createdAt: "asc" } } },
    orderBy: [{ isStarred: "desc" }, { updatedAt: "desc" }],
  });
  return apps.map(serializeApplication);
}

export async function getSettingsForUser(userId: string): Promise<UserSettingsView> {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return serializeSettings(settings);
}

export async function getActiveGhostSnoozeIds(userId: string): Promise<string[]> {
  const snoozes = await prisma.ghostSnooze.findMany({
    where: { userId, snoozedUntil: { gt: new Date() } },
    select: { applicationId: true },
  });
  return snoozes.map((snooze) => snooze.applicationId);
}
