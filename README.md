# JobFlow

A personal job application tracker built with Next.js 16, TypeScript, Supabase Auth, Prisma, PostgreSQL, and Tailwind CSS. Track your job search from wishlist to offer with a responsive kanban board, sortable table, summary view, and stats dashboard — all in a clean dark UI.

---

## Features

- **Kanban Board** — drag-and-drop cards across pipeline stages (Saved → Applied → Interview → Offer → Rejected / Ghosted)
- **Table View** — sortable, paginated list with inline stage actions
- **Summary Page** — scannable list with pipeline progress indicators, follow-up dates, and source tags
- **Stats Dashboard** — donut chart, weekly volume line chart, top sources bar chart, and win/loss funnel
- **Application Modal** — full form with company, role, stage, job URL, contacts, salary, interview rounds, and notes
- **Ghost Detection** — automatically suggests marking stale applications (14+ days inactive) as Ghosted
- **Filter Bar** — search, source filter, date range, and starred-only toggle with keyboard shortcuts
- **Dark Mode** — fully dark UI with warm neutral palette
- **Responsive Mobile App UI** — bottom mobile tabs, stage-tab board, mobile card table, and full-screen mobile drawer
- **Supabase Auth** — protected application routes with user-owned data

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Font | Geist (Sans + Mono) |
| Drag & Drop | @dnd-kit/core |
| Charts | Recharts |
| Icons | Lucide React |
| ORM | Prisma |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a [Supabase](https://supabase.com) project)

### 1. Clone the repo

```bash
git clone https://github.com/Josephatada/jobflow-app.git
cd jobflow-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

If using Supabase, grab the database connection string from **Project Settings → Database → Connection string (URI)** and the auth keys from **Project Settings → API**.

### 4. Run database migrations

```bash
npm run db:migrate
```

To seed with sample data:

```bash
SEED_USER_ID="SUPABASE_AUTH_USER_ID" \
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production deploy on Vercel

1. Create a Supabase project and enable the sign-in methods you want to support.
2. Add `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel environment variables.
3. Run Prisma migrations against Supabase:

```bash
npm run db:migrate
```

4. Deploy to Vercel. The `postinstall` script runs `prisma generate` during install.

---

## Project Structure

```
jobflow-app/
├── app/
│   ├── board/          # Authenticated kanban + table view
│   ├── summary/        # Authenticated scannable list view
│   ├── stats/          # Authenticated charts & analytics
│   ├── settings/       # Persisted ghost threshold, notifications
│   ├── login/          # Supabase Auth sign-in
│   ├── layout.tsx      # Root layout with TopNav
│   └── globals.css     # Dark theme variables & animations
├── components/
│   ├── board/
│   │   ├── ApplicationCard.tsx     # Kanban card
│   │   ├── ApplicationDrawer.tsx   # Add/edit modal
│   │   ├── DroppableColumn.tsx     # Kanban column
│   │   ├── FilterBar.tsx           # Search + filter controls
│   │   ├── GhostToast.tsx          # Ghost suggestion toast
│   │   ├── InterviewRounds.tsx     # Interview round tracker
│   │   ├── KanbanBoard.tsx         # Main board controller
│   │   └── TableView.tsx           # Table + pagination
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Toggle.tsx
│       └── TopNav.tsx
├── lib/
│   ├── data.ts         # Server-side data loading/serialization
│   ├── mock-data.ts    # Sample applications for demo/seed reference
│   ├── stages.ts       # Stage config (label, color, dot)
│   ├── stats.ts        # Stats computation helpers
│   └── utils.ts        # cn, formatDate, daysSince, isOverdue
└── prisma/
    ├── schema.prisma   # Application, StageHistory, InterviewRound
    └── seed.ts         # Database seed script
```

---

## Database Schema

```prisma
model Application {
  id              String           @id @default(cuid())
  userId          String
  company         String
  roleTitle       String
  stage           Stage            @default(wishlist)
  jobUrl          String?
  location        String?
  source          Source?
  dateApplied     DateTime?
  followUpDate    DateTime?
  contactName     String?
  contactEmail    String?
  salaryRange     String?
  isStarred       Boolean          @default(false)
  notes           String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  stageHistory    StageHistory[]
  interviewRounds InterviewRound[]
}
```

Stages: `wishlist` · `applied` · `interview` · `offer` · `rejected` · `ghosted`  
Sources: `linkedin` · `referral` · `company_site` · `job_board` · `other`

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run test         # Run unit tests
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `N` | Add new application |
| `/` | Focus search bar |

---

## Notes

- Runtime application data is loaded from PostgreSQL and scoped to the authenticated Supabase user.
- `lib/mock-data.ts` is retained for seed/demo reference only.
- Email digests, CSV import/export, and team workspaces are intentionally outside the first production scope.

---

## License

MIT
