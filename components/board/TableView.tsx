"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Star, Calendar, ChevronsUpDown, MoreHorizontal, Ghost, XCircle, Pencil, Trash2 } from "lucide-react";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { STAGE_MAP } from "@/lib/stages";
import type { ApplicationView } from "@/lib/types";

type SortKey = "company" | "stage" | "dateApplied" | "followUpDate" | "salaryRange" | "source";
type SortDir  = "asc" | "desc";

interface TableViewProps {
  applications:   ApplicationView[];
  onRowClick:     (app: ApplicationView) => void;
  onStageChange?: (id: string, stage: ApplicationView["stage"]) => void;
  onDelete?:      (id: string) => void;
  onStarToggle?:  (app: ApplicationView) => void;
}

const PAGE_SIZE = 15;

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn", referral: "Referral",
  company_site: "Company Site", job_board: "Job Board", other: "Other",
};

const STAGE_CHIP: Record<string, string> = {
  wishlist:  "bg-zinc-800/50 text-zinc-400",
  applied:   "bg-blue-950/50 text-blue-400",
  interview: "bg-orange-950/50 text-orange-400",
  offer:     "bg-emerald-950/50 text-emerald-400",
  rejected:  "bg-red-950/50 text-red-400",
  ghosted:   "bg-zinc-800/30 text-zinc-500",
};

function sortApps(apps: ApplicationView[], key: SortKey, dir: SortDir): ApplicationView[] {
  return [...apps].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    if (key === "company")      { av = a.company; bv = b.company; }
    if (key === "stage")        { av = a.stage;   bv = b.stage; }
    if (key === "dateApplied")  { av = a.dateApplied  ? +new Date(a.dateApplied)  : 0; bv = b.dateApplied  ? +new Date(b.dateApplied)  : 0; }
    if (key === "followUpDate") { av = a.followUpDate ? +new Date(a.followUpDate) : 0; bv = b.followUpDate ? +new Date(b.followUpDate) : 0; }
    if (key === "salaryRange")  { av = a.salaryRange ?? ""; bv = b.salaryRange ?? ""; }
    if (key === "source")       { av = a.source ?? "";      bv = b.source ?? ""; }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ?  1 : -1;
    return 0;
  });
}

/* ── Row action menu ──────────────────────────────────────────────────── */
function ActionMenu({ app, onEdit, onGhost, onReject, onDelete }: {
  app: ApplicationView; onEdit: () => void; onGhost: () => void; onReject: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-6 h-6 flex items-center justify-center rounded-md text-[#6b6762] hover:text-[#a8a49e] hover:bg-[#252320] transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute right-0 top-7 z-20 w-44 bg-[#1c1b19] border border-[#2d2b27] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] py-1">
            {[
              { label: "Edit",             icon: Pencil,  fn: onEdit,   cls: "text-[#a8a49e]" },
              ...(app.stage !== "ghosted"  ? [{ label: "Mark Ghosted",  icon: Ghost,   fn: onGhost,  cls: "text-[#a8a49e]" }] : []),
              ...(app.stage !== "rejected" ? [{ label: "Mark Rejected", icon: XCircle, fn: onReject, cls: "text-[#a8a49e]" }] : []),
            ].map(({ label, icon: Icon, fn, cls }) => (
              <button key={label} onClick={(e) => { e.stopPropagation(); fn(); setOpen(false); }}
                className={cn("w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] hover:bg-[#252320]", cls)}>
                <Icon className="w-3.5 h-3.5 text-[#6b6762]" /> {label}
              </button>
            ))}
            <div className="my-1 border-t border-[#2d2b27]" />
            <button onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-950/30">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────── */
export function TableView({ applications, onRowClick, onStageChange, onDelete, onStarToggle }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("dateApplied");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page,    setPage]    = useState(1);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  const sorted     = sortApps(applications, sortKey, sortDir);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortBtn({ col }: { col: SortKey }) {
    const active = sortKey === col;
    return (
      <span className={cn("inline-flex items-center", active ? "text-orange-500" : "text-[#6b6762]")}>
        {!active && <ChevronsUpDown className="w-3 h-3" />}
        {active && sortDir === "asc"  && <ChevronUp   className="w-3 h-3" />}
        {active && sortDir === "desc" && <ChevronDown  className="w-3 h-3" />}
      </span>
    );
  }

  const COLS: { key: SortKey; label: string; cls?: string }[] = [
    { key: "company",      label: "Company" },
    { key: "stage",        label: "Stage",     cls: "w-[120px]" },
    { key: "dateApplied",  label: "Applied",   cls: "w-[105px]" },
    { key: "followUpDate", label: "Follow-up", cls: "w-[115px]" },
    { key: "salaryRange",  label: "Salary",    cls: "w-[125px]" },
    { key: "source",       label: "Source",    cls: "w-[110px]" },
  ];

  return (
    <div className="px-3 sm:px-5 py-4 pb-24 sm:pb-4">
      <div className="sm:hidden space-y-2">
        {paginated.length === 0 && (
          <div className="px-4 py-16 text-center text-[12px] text-[#6b6762] border border-[#2d2b27] rounded-xl bg-[#1c1b19]">
            No applications match your filters
          </div>
        )}
        {paginated.map((app) => {
          const stageInfo = STAGE_MAP[app.stage];
          const overdue = isOverdue(app.followUpDate);
          const companyLabel = app.company || "Untitled application";
          const roleLabel = app.roleTitle || "No role title";
          return (
            <button
              key={app.id}
              onClick={() => onRowClick(app)}
              className="w-full text-left bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#f0ede8] text-sm truncate">{companyLabel}</p>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stageInfo?.dot)} />
                  </div>
                  <p className="text-xs text-[#6b6762] truncate mt-0.5">{roleLabel}</p>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-md shrink-0", STAGE_CHIP[app.stage])}>
                  {stageInfo?.label}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#6b6762]">
                {app.dateApplied && <span>Applied {formatDate(app.dateApplied)}</span>}
                {app.followUpDate && (
                  <span className={cn("inline-flex items-center gap-1", overdue && "text-red-400")}>
                    <Calendar className="w-3 h-3" />
                    {formatDate(app.followUpDate)}
                  </span>
                )}
                {app.source && <span>{SOURCE_LABELS[app.source]}</span>}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onStarToggle?.(app);
                  }}
                  className="min-h-10 min-w-10 rounded-lg border border-[#2d2b27] flex items-center justify-center"
                  aria-label={app.isStarred ? "Unstar application" : "Star application"}
                >
                  <Star className={cn("w-4 h-4", app.isStarred ? "text-orange-400 fill-orange-400" : "text-[#6b6762]")} />
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStageChange?.(app.id, "ghosted");
                    }}
                    className="h-10 px-3 rounded-lg border border-[#2d2b27] text-xs text-[#a8a49e]"
                  >
                    Ghost
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete?.(app.id);
                    }}
                    className="h-10 px-3 rounded-lg border border-red-900/50 text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="hidden sm:block bg-[#1c1b19] border border-[#2d2b27] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[12px]">

            {/* Head */}
            <thead>
              <tr className="border-b border-[#2d2b27] bg-[#181716]">
                <th className="w-9 px-3 py-2.5" />
                {COLS.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)}
                    className={cn("px-3 py-2.5 text-left font-semibold text-[#6b6762] cursor-pointer hover:text-[#a8a49e] select-none", col.cls)}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortBtn col={col.key} />
                    </div>
                  </th>
                ))}
                <th className="w-9 px-3 py-2.5" />
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[#232220]">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[12px] text-[#6b6762]">
                    No applications match your filters
                  </td>
                </tr>
              )}
              {paginated.map((app) => {
                const stageInfo = STAGE_MAP[app.stage];
                const overdue   = isOverdue(app.followUpDate);
                const companyLabel = app.company || "Untitled application";
                const roleLabel = app.roleTitle || "No role title";
                return (
                  <tr key={app.id} onClick={() => onRowClick(app)}
                    className="group cursor-pointer hover:bg-[#232220] transition-colors duration-100">

                    {/* Star */}
                    <td className="px-3 py-3">
                      <Star className={cn("w-3 h-3 transition-colors", app.isStarred ? "text-orange-400 fill-orange-400" : "text-[#2d2b27] group-hover:text-[#3a3835]")} />
                    </td>

                    {/* Company */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-950 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-orange-400">{companyLabel.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#f0ede8] truncate tracking-[-0.01em]">{companyLabel}</p>
                          <p className="text-[11px] text-[#6b6762] truncate mt-0.5">{roleLabel}</p>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[10px]", STAGE_CHIP[app.stage])}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stageInfo?.dot)} />
                        {stageInfo?.label}
                      </span>
                    </td>

                    {/* Applied */}
                    <td className="px-3 py-3 text-[#a8a49e] whitespace-nowrap">
                      {app.dateApplied ? formatDate(app.dateApplied) : <span className="text-[#3a3835]">—</span>}
                    </td>

                    {/* Follow-up */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {app.followUpDate ? (
                        <span className={cn("inline-flex items-center gap-1 font-medium", overdue ? "text-red-400" : "text-[#a8a49e]")}>
                          <Calendar className="w-3 h-3 shrink-0" />
                          {formatDate(app.followUpDate)}
                        </span>
                      ) : <span className="text-[#3a3835]">—</span>}
                    </td>

                    {/* Salary */}
                    <td className="px-3 py-3 text-[#a8a49e] whitespace-nowrap font-mono text-[11px]">
                      {app.salaryRange || <span className="text-[#3a3835] font-sans">—</span>}
                    </td>

                    {/* Source */}
                    <td className="px-3 py-3 text-[#6b6762] whitespace-nowrap">
                      {app.source ? SOURCE_LABELS[app.source] : <span className="text-[#3a3835]">—</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        app={app}
                        onEdit={()   => onRowClick(app)}
                        onGhost={()  => onStageChange?.(app.id, "ghosted")}
                        onReject={() => onStageChange?.(app.id, "rejected")}
                        onDelete={() => onDelete?.(app.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#2d2b27] bg-[#181716]">
            <p className="text-[11px] text-[#6b6762]">
              <span className="font-semibold text-[#a8a49e]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}</span> of <span className="font-semibold text-[#a8a49e]">{sorted.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#2d2b27] text-[#a8a49e] hover:bg-[#252320] disabled:opacity-30 disabled:cursor-not-allowed">
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("w-6 h-6 text-[11px] font-medium rounded-md transition-colors",
                    p === page ? "bg-orange-600 text-white" : "text-[#a8a49e] hover:bg-[#252320] border border-[#2d2b27]")}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#2d2b27] text-[#a8a49e] hover:bg-[#252320] disabled:opacity-30 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {totalPages === 1 && sorted.length > 0 && (
        <p className="mt-2.5 text-[11px] text-[#6b6762] text-right">{sorted.length} application{sorted.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}
