"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient, requireUser } from "@/lib/supabase/server";
import { serializeApplication } from "@/lib/data";
import type { ActionResult, ApplicationView, InterviewRoundView, UserSettingsView } from "@/lib/types";
import type { Source, Stage } from "@prisma/client";

const STAGES: Stage[] = ["wishlist", "applied", "interview", "offer", "rejected", "ghosted"];
const SOURCES: Source[] = ["linkedin", "referral", "company_site", "job_board", "other"];

function optionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function requiredText(value: unknown, label: string) {
  const trimmed = optionalText(value);
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

function optionalDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function parseStage(value: unknown): Stage {
  if (STAGES.includes(value as Stage)) return value as Stage;
  return "wishlist";
}

function parseSource(value: unknown): Source | null {
  if (!value) return null;
  return SOURCES.includes(value as Source) ? value as Source : null;
}

function parseRounds(rounds: InterviewRoundView[] | undefined) {
  return (rounds ?? [])
    .map((round) => ({
      label: optionalText(round.label),
      date: optionalDate(round.date),
    }))
    .filter((round): round is { label: string; date: Date | null } => Boolean(round.label));
}

function revalidateApp() {
  // /board is included so the router cache stays fresh after creates/deletes/
  // star toggles. changeStageAction deliberately does NOT call revalidateApp()
  // because revalidating /board while a drag is in flight remounts KanbanBoard
  // and causes an undo→redo flicker (useState resets to initialApplications).
  revalidatePath("/board");
  revalidatePath("/summary");
  revalidatePath("/stats");
  revalidatePath("/settings");
}

export async function saveApplicationAction(input: ApplicationView): Promise<ActionResult<ApplicationView>> {
  try {
    const user = await requireUser();
    const data = {
      company: optionalText(input.company) ?? "",
      roleTitle: optionalText(input.roleTitle) ?? "",
      jobUrl: requiredText(input.jobUrl, "Job URL"),
      location: optionalText(input.location),
      source: parseSource(input.source),
      dateApplied: optionalDate(input.dateApplied),
      contactName: optionalText(input.contactName),
      contactEmail: optionalText(input.contactEmail),
      salaryRange: optionalText(input.salaryRange),
      stage: parseStage(input.stage),
      followUpDate: optionalDate(input.followUpDate),
      isStarred: Boolean(input.isStarred),
      notes: optionalText(input.notes),
    };

    const isExistingId = input.id && !input.id.startsWith("new-");
    const existing = isExistingId
      ? await prisma.application.findFirst({ where: { id: input.id, userId: user.id } })
      : null;
    if (isExistingId && !existing) {
      throw new Error("Application not found. Refresh and try again.");
    }

    const app = await prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.application.update({
            where: { id: existing.id },
            data,
            include: { interviewRounds: { orderBy: { createdAt: "asc" } } },
          })
        : await tx.application.create({
            data: { ...data, userId: user.id },
            include: { interviewRounds: { orderBy: { createdAt: "asc" } } },
          });

      if (!existing || existing.stage !== data.stage) {
        await tx.stageHistory.create({
          data: {
            applicationId: saved.id,
            fromStage: existing?.stage ?? null,
            toStage: data.stage,
          },
        });
      }

      await tx.interviewRound.deleteMany({ where: { applicationId: saved.id } });
      const rounds = parseRounds(input.interviewRounds);
      if (rounds.length) {
        await tx.interviewRound.createMany({
          data: rounds.map((round) => ({ ...round, applicationId: saved.id })),
        });
      }

      return tx.application.findUniqueOrThrow({
        where: { id: saved.id },
        include: { interviewRounds: { orderBy: { createdAt: "asc" } } },
      });
    });

    revalidateApp();
    return { ok: true, data: serializeApplication(app) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to save application" };
  }
}

export async function deleteApplicationAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const existing = await prisma.application.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new Error("Application not found");
    await prisma.application.delete({ where: { id } });
    revalidateApp();
    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to delete application" };
  }
}

export async function changeStageAction(id: string, stage: Stage): Promise<ActionResult<ApplicationView>> {
  try {
    const user = await requireUser();
    const existing = await prisma.application.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new Error("Application not found");
    const nextStage = parseStage(stage);

    const app = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: { stage: nextStage },
        include: { interviewRounds: { orderBy: { createdAt: "asc" } } },
      });
      if (existing.stage !== nextStage) {
        await tx.stageHistory.create({
          data: { applicationId: id, fromStage: existing.stage, toStage: nextStage },
        });
      }
      return updated;
    });

    revalidateApp();
    return { ok: true, data: serializeApplication(app) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to change stage" };
  }
}

export async function toggleStarAction(id: string, isStarred: boolean): Promise<ActionResult<ApplicationView>> {
  try {
    const user = await requireUser();
    const app = await prisma.application.update({
      where: { id, userId: user.id },
      data: { isStarred },
      include: { interviewRounds: { orderBy: { createdAt: "asc" } } },
    });
    revalidateApp();
    return { ok: true, data: serializeApplication(app) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update star" };
  }
}

export async function updateSettingsAction(input: UserSettingsView): Promise<ActionResult<UserSettingsView>> {
  try {
    const user = await requireUser();
    const ghostThresholdDays = Math.min(365, Math.max(1, Math.round(input.ghostThresholdDays)));
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ghostThresholdDays,
        emailDigestEnabled: input.emailDigestEnabled,
      },
      update: {
        ghostThresholdDays,
        emailDigestEnabled: input.emailDigestEnabled,
      },
    });
    revalidateApp();
    return {
      ok: true,
      data: {
        ghostThresholdDays: settings.ghostThresholdDays,
        emailDigestEnabled: settings.emailDigestEnabled,
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update settings" };
  }
}

export async function snoozeGhostAction(applicationId: string): Promise<ActionResult<{ applicationId: string }>> {
  try {
    const user = await requireUser();
    const app = await prisma.application.findFirst({ where: { id: applicationId, userId: user.id } });
    if (!app) throw new Error("Application not found");
    const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.ghostSnooze.upsert({
      where: { userId_applicationId: { userId: user.id, applicationId } },
      create: { userId: user.id, applicationId, snoozedUntil },
      update: { snoozedUntil },
    });
    revalidatePath("/board");
    return { ok: true, data: { applicationId } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to snooze suggestion" };
  }
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
