CREATE TYPE "Stage" AS ENUM ('wishlist', 'applied', 'interview', 'offer', 'rejected', 'ghosted');

CREATE TYPE "Source" AS ENUM ('linkedin', 'referral', 'company_site', 'job_board', 'other');

CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "jobUrl" TEXT,
  "location" TEXT,
  "source" "Source",
  "dateApplied" TIMESTAMP(3),
  "contactName" TEXT,
  "contactEmail" TEXT,
  "salaryRange" TEXT,
  "stage" "Stage" NOT NULL DEFAULT 'wishlist',
  "followUpDate" TIMESTAMP(3),
  "isStarred" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StageHistory" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "fromStage" "Stage",
  "toStage" "Stage" NOT NULL,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StageHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewRound" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "date" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewRound_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "ghostThresholdDays" INTEGER NOT NULL DEFAULT 14,
  "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GhostSnooze" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "snoozedUntil" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GhostSnooze_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Application_userId_idx" ON "Application"("userId");
CREATE INDEX "Application_userId_stage_idx" ON "Application"("userId", "stage");
CREATE INDEX "Application_userId_updatedAt_idx" ON "Application"("userId", "updatedAt");
CREATE INDEX "Application_userId_followUpDate_idx" ON "Application"("userId", "followUpDate");
CREATE INDEX "Application_userId_createdAt_idx" ON "Application"("userId", "createdAt");
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
CREATE UNIQUE INDEX "GhostSnooze_userId_applicationId_key" ON "GhostSnooze"("userId", "applicationId");
CREATE INDEX "GhostSnooze_userId_snoozedUntil_idx" ON "GhostSnooze"("userId", "snoozedUntil");

ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewRound" ADD CONSTRAINT "InterviewRound_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GhostSnooze" ADD CONSTRAINT "GhostSnooze_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
