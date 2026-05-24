"use client";

import { useState, useMemo } from "react";
import { Star, Calendar, ArrowRight, Search, X, Clock } from "lucide-react";
import { cn, formatDate, daysSince, isOverdue } from "@/lib/utils";
import { MOCK_APPLICATIONS, type Application } from "@/lib/mock-data";
import type { Stage } from "@prisma/client";

// ── Pipeline config ──────────────────────────────────────────────────────────
const PIPELINE: { slug: Stage; label: string; short: string }[] = [
  { slug: "wishlist",  label: "Saved",     short: "Saved" },
  { slug: "applied",   label: "Applied",   short: "Applied" },
  { slug: "interview", label: "Interview", short: "Interview" },
  { slug: "offer",     label: "Offer",     short: "Offer" },
];

const TERMINAL: Stage[] = ["rejected", "ghosted"];

const STAGE_DOT: Record<Stage, string> = {
  wishlist:  "bg-zinc-500",
  applied:   "bg-blue-400",
  interview: "bg-orange-400",
  offer:     "bg-emerald-400",
  rejected:  "bg-red-400",
  ghosted:   "bg-zinc-600",
};

const STAGE_LABEL: Record<Stage, string> = {
  wishlist:  "Saved",
  applied:   "Applied",
  interview: "Interview",
  offer:     "Offer",
  rejected:  "Rejected",
  ghosted:   "Ghosted",
};

const STAGE_CHIP: Record<Stage, string> = {
  wishlist:  "bg-zinc-800/50 text-zinc-400 border-zinc-700/50",
  applied:   "bg-blue-950/50 text-blue-400 border-blue-900/50",
  interview: "bg-orange-950/50 text-orange-400 border-orange-900/50",
  offer:     "bg-emerald-950/50 text-emerald-400 border-emerald-900/50",
  rejected:  "bg-red-950/50 text-red-400 border-red-900/50",
  ghosted:   "bg-zinc-800/30 text-zinc-500 border-zinc-700/30",
};

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn", referral: "Referral",
  company_site: "Company Site", job_board: "Job Board", other: "Other",
};

// ── Pipeline mini-indicator ──────────────────────────────────────────────────
function PipelineBar({ stage }: { stage: Stage }) {
  const isTerminal = TERMINAL.includes(stage);
  const currentIdx = PIPELINE.findIndex(p => p.slug === stage);

  if (isTerminal) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
          STAGE_CHIP[stage]
        )}>
          {STAGE_LABEL[stage]}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {PIPELINE.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const pending = i > currentIdx;
        return (
          <div key={step.slug} className="flex items-center gap-0.5">
            {i > 0 && (
              <div className={cn(
                "w-4 h-px rounded-full transition-colors",
                done ? "bg-[#3a3835]" : "bg-[#252320]"
              )} />
            )}
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all",
              active  && "bg-orange-950/50 text-orange-400",
              done    && "text-[#6b6762]",
              pending && "text-[#3a3835]",
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                active  && "bg-orange-400",
                done    && "bg-[#3a3835]",
                pending && "bg-[#252320]",
              )} />
              <span className={cn(pending && "hidden sm:inline")}>{step.short}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const AVATAR_COLORS = [
  ["bg-zinc-800",     "text-zinc-400"],
  ["bg-blue-950",     "text-blue-400"],
  ["bg-violet-950",   "text-violet-400"],
  ["bg-emerald-950",  "text-emerald-400"],
  ["bg-amber-950",    "text-amber-400"],
  ["bg-rose-950",     "text-rose-400"],
];

function getAvatarStyle(company: string): [string, string] {
  const idx = company.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] as [string, string];
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className={cn("text-[13px] font-bold tabular-nums tracking-tight", accent ?? "text-[#f0ede8]")}>{value}</span>
      <span className="text-[11px] text-[#6b6762]">{label}</span>
    </div>
  );
}

// ── Sort + filter controls ────────────────────────────────────────────────────
type SortBy = "recent" | "company" | "stage" | "followup";
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "recent",  label: "Recent activity" },
  { value: "company", label: "Company A–Z" },
  { value: "stage",   label: "Pipeline stage" },
  { value: "followup",label: "Follow-up date" },
];

// ── Group label ────────────────────────────────────────────────────────────
const STAGE_ORDER: Stage[] = ["wishlist", "applied", "interview", "offer", "rejected", "ghosted"];

// ── Main component ────────────────────────────────────────────────────────────
export default function SummaryPage() {
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState<SortBy>("recent");
  const [groupBy, setGroupBy] = useState(false);

  const apps = MOCK_APPLICATIONS;

  // Stats
  const total     = apps.length;
  const active    = apps.filter(a => ["applied", "interview", "offer"].includes(a.stage)).length;
  const interview = apps.filter(a => a.stage === "interview").length;
  const offers    = apps.filter(a => a.stage === "offer").length;
  const overdue   = apps.filter(a => isOverdue(a.followUpDate)).length;
  const responseRate = total > 0
    ? Math.round((apps.filter(a => ["interview","offer","rejected","ghosted"].includes(a.stage)).length / total) * 100)
    : 0;

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = apps.filter(a =>
      !q || a.company.toLowerCase().includes(q) || a.roleTitle.toLowerCase().includes(q)
    );
    if (sortBy === "recent")  list = [...list].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (sortBy === "company") list = [...list].sort((a, b) => a.company.localeCompare(b.company));
    if (sortBy === "stage")   list = [...list].sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));
    if (sortBy === "followup") {
      list = [...list].sort((a, b) => {
        if (!a.followUpDate && !b.followUpDate) return 0;
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        return +new Date(a.followUpDate) - +new Date(b.followUpDate);
      });
    }
    return list;
  }, [apps, search, sortBy]);

  // Grouped
  const grouped = useMemo(() => {
    if (!groupBy) return null;
    return STAGE_ORDER.reduce<Record<Stage, Application[]>>((acc, s) => {
      acc[s] = filtered.filter(a => a.stage === s);
      return acc;
    }, {} as Record<Stage, Application[]>);
  }, [filtered, groupBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <h1 className="text-[13px] font-semibold text-[#f0ede8] tracking-[-0.01em]">Summary</h1>
        <div className="flex items-center gap-1.5">
          <StatPill label="total"     value={total} />
          <StatPill label="active"    value={active}    accent="text-blue-400" />
          <StatPill label="interview" value={interview}  accent="text-orange-400" />
          <StatPill label="offers"    value={offers}    accent="text-emerald-400" />
          {overdue > 0 && <StatPill label="overdue" value={overdue} accent="text-red-400" />}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 h-[40px] bg-[#161614] border-b border-[#2d2b27] shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6b6762] pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-7 pl-7 pr-7 text-[12px] rounded-md border border-[#2d2b27] bg-[#1c1b19] text-[#f0ede8] placeholder:text-[#6b6762] focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600/50 w-[180px] transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6762] hover:text-[#a8a49e]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="w-px h-4 bg-[#2d2b27] shrink-0" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="h-7 px-2.5 text-[12px] rounded-md border border-[#2d2b27] bg-[#1c1b19] text-[#a8a49e] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-600/30 transition-colors hover:border-[#3a3835]"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Group toggle */}
        <button
          onClick={() => setGroupBy(v => !v)}
          className={cn(
            "h-7 px-2.5 text-[12px] font-medium rounded-md border transition-all duration-150",
            groupBy
              ? "bg-orange-950/40 border-orange-900/50 text-orange-400"
              : "bg-[#1c1b19] border-[#2d2b27] text-[#a8a49e] hover:border-[#3a3835] hover:text-[#f0ede8]"
          )}
        >
          Group by stage
        </button>

        <span className="ml-auto text-[11px] text-[#6b6762]">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-1.5">
          {!groupBy ? (
            <AppList apps={filtered} />
          ) : (
            STAGE_ORDER.map(stage => {
              const list = grouped![stage];
              if (!list || list.length === 0) return null;
              return (
                <div key={stage} className="mb-5">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={cn("w-2 h-2 rounded-full", STAGE_DOT[stage])} />
                    <span className="text-[11px] font-semibold text-[#6b6762] uppercase tracking-widest">{STAGE_LABEL[stage]}</span>
                    <span className="text-[10px] font-semibold text-[#6b6762] bg-[#252320] rounded-full px-1.5 py-0.5 tabular-nums">{list.length}</span>
                  </div>
                  <AppList apps={list} />
                </div>
              );
            })
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#252320] flex items-center justify-center mb-3">
                <Search className="w-4 h-4 text-[#6b6762]" />
              </div>
              <p className="text-[13px] font-medium text-[#a8a49e]">No applications found</p>
              <p className="text-[12px] text-[#6b6762] mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Application row ───────────────────────────────────────────────────────────
function AppRow({ app }: { app: Application }) {
  const days    = daysSince(app.updatedAt);
  const overdue = isOverdue(app.followUpDate);
  const [avatarBg, avatarText] = (() => {
    const COLORS = [
      ["bg-zinc-800",     "text-zinc-400"],
      ["bg-blue-950",     "text-blue-400"],
      ["bg-violet-950",   "text-violet-400"],
      ["bg-emerald-950",  "text-emerald-400"],
      ["bg-amber-950",    "text-amber-400"],
      ["bg-rose-950",     "text-rose-400"],
    ];
    const idx = app.company.charCodeAt(0) % COLORS.length;
    return COLORS[idx] as [string, string];
  })();

  return (
    <div className={cn(
      "group flex items-center gap-4 bg-[#1c1b19] border border-[#2d2b27] rounded-xl px-4 py-3",
      "hover:border-[#3a3835] hover:shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:-translate-y-[1px]",
      "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none"
    )}>

      {/* Avatar */}
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", avatarBg)}>
        <span className={cn("text-[10px] font-bold", avatarText)}>{app.company.slice(0, 2).toUpperCase()}</span>
      </div>

      {/* Company + Role */}
      <div className="min-w-0 w-[200px] shrink-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold text-[#f0ede8] tracking-[-0.01em] truncate">{app.company}</p>
          {app.isStarred && <Star className="w-2.5 h-2.5 text-orange-400 fill-orange-400 shrink-0" />}
        </div>
        <p className="text-[11px] text-[#6b6762] truncate mt-0.5">{app.roleTitle}</p>
      </div>

      {/* Pipeline */}
      <div className="flex-1 min-w-0 hidden sm:flex">
        <PipelineBar stage={app.stage} />
      </div>

      {/* Applied date */}
      <div className="w-[90px] shrink-0 hidden md:block">
        {app.dateApplied ? (
          <p className="text-[11px] text-[#a8a49e]">{formatDate(app.dateApplied)}</p>
        ) : (
          <p className="text-[11px] text-[#3a3835]">—</p>
        )}
      </div>

      {/* Follow-up */}
      <div className="w-[110px] shrink-0 hidden md:block">
        {app.followUpDate ? (
          <span className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium",
            overdue ? "text-red-400" : "text-[#a8a49e]"
          )}>
            <Calendar className="w-2.5 h-2.5 shrink-0" />
            {formatDate(app.followUpDate)}
          </span>
        ) : (
          <span className="text-[11px] text-[#3a3835]">No follow-up</span>
        )}
      </div>

      {/* Last activity */}
      <div className="w-[80px] shrink-0 text-right hidden lg:block">
        <span className="inline-flex items-center gap-1 text-[11px] text-[#6b6762]">
          <Clock className="w-2.5 h-2.5 shrink-0" />
          {days === 0 ? "Today" : `${days}d ago`}
        </span>
      </div>

      {/* Source */}
      <div className="w-[80px] shrink-0 hidden lg:block">
        {app.source ? (
          <span className="text-[10px] font-medium text-[#6b6762] bg-[#252320] border border-[#2d2b27] px-1.5 py-0.5 rounded-md">
            {SOURCE_LABELS[app.source] ?? app.source}
          </span>
        ) : (
          <span className="text-[11px] text-[#3a3835]">—</span>
        )}
      </div>
    </div>
  );
}

function AppList({ apps }: { apps: Application[] }) {
  return (
    <div>
      {/* Column headers */}
      <div className="flex items-center gap-4 px-4 pb-1.5 mb-1">
        <div className="w-8 shrink-0" />
        <div className="w-[200px] shrink-0 text-[10px] font-semibold text-[#6b6762] uppercase tracking-widest">Company</div>
        <div className="flex-1 min-w-0 hidden sm:block text-[10px] font-semibold text-[#6b6762] uppercase tracking-widest">Pipeline</div>
        <div className="w-[90px] shrink-0 hidden md:block text-[10px] font-semibold text-[#6b6762] uppercase tracking-widest">Applied</div>
        <div className="w-[110px] shrink-0 hidden md:block text-[10px] font-semibold text-[#6b6762] uppercase tracking-widest">Follow-up</div>
        <div className="w-[80px] shrink-0 hidden lg:block text-[10px] font-semibold text-[#6b6762] uppercase tracking-widest text-right">Last active</div>
        <div className="w-[80px] shrink-0 hidden lg:block text-[10px] font-semibold text-[#6b6762] uppercase tracking-widest">Source</div>
      </div>
      <div className="space-y-1.5">
        {apps.map(app => <AppRow key={app.id} app={app} />)}
      </div>
    </div>
  );
}
