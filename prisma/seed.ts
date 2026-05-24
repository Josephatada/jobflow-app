import { PrismaClient } from "@prisma/client";
import type { Stage, Source } from "@prisma/client";

const prisma = new PrismaClient();

const samples: {
  company: string;
  roleTitle: string;
  stage: Stage;
  source: Source;
  isStarred: boolean;
  location: string;
  salaryRange?: string;
  dateApplied?: Date;
  followUpDate?: Date;
}[] = [
  {
    company: "Stripe",
    roleTitle: "Senior Frontend Engineer",
    stage: "interview",
    source: "linkedin",
    isStarred: true,
    location: "Remote",
    salaryRange: "$180k–$220k",
    dateApplied: new Date("2026-05-01"),
    followUpDate: new Date("2026-05-20"),
  },
  {
    company: "Linear",
    roleTitle: "Product Designer",
    stage: "applied",
    source: "company_site",
    isStarred: true,
    location: "San Francisco, CA",
    salaryRange: "$150k–$180k",
    dateApplied: new Date("2026-05-10"),
    followUpDate: new Date("2026-05-25"),
  },
  {
    company: "Vercel",
    roleTitle: "Developer Advocate",
    stage: "wishlist",
    source: "other",
    isStarred: false,
    location: "Remote",
  },
  {
    company: "Notion",
    roleTitle: "Full Stack Engineer",
    stage: "applied",
    source: "referral",
    isStarred: false,
    location: "New York, NY",
    salaryRange: "$160k–$190k",
    dateApplied: new Date("2026-05-12"),
  },
  {
    company: "Figma",
    roleTitle: "Software Engineer, Platform",
    stage: "rejected",
    source: "linkedin",
    isStarred: false,
    location: "San Francisco, CA",
    dateApplied: new Date("2026-04-20"),
  },
  {
    company: "Loom",
    roleTitle: "React Native Engineer",
    stage: "ghosted",
    source: "job_board",
    isStarred: false,
    location: "Remote",
    dateApplied: new Date("2026-04-10"),
  },
  {
    company: "Anthropic",
    roleTitle: "Product Engineer",
    stage: "offer",
    source: "referral",
    isStarred: true,
    location: "San Francisco, CA",
    salaryRange: "$200k–$250k",
    dateApplied: new Date("2026-04-28"),
  },
];

async function main() {
  const userId = process.env.SEED_USER_ID;
  if (!userId) {
    throw new Error("Set SEED_USER_ID to a Supabase auth user id before seeding.");
  }

  await prisma.stageHistory.deleteMany();
  await prisma.interviewRound.deleteMany();
  await prisma.ghostSnooze.deleteMany();
  await prisma.application.deleteMany();
  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  for (const data of samples) {
    const app = await prisma.application.create({ data: { ...data, userId } });
    await prisma.stageHistory.create({
      data: {
        applicationId: app.id,
        fromStage: null,
        toStage: app.stage,
      },
    });

    if (app.stage === "interview") {
      await prisma.interviewRound.createMany({
        data: [
          { applicationId: app.id, label: "Phone Screen", date: new Date("2026-05-08") },
          { applicationId: app.id, label: "Technical", date: new Date("2026-05-15") },
        ],
      });
    }
  }

  console.log(`Seeded ${samples.length} applications`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
