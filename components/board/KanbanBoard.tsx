"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, LayoutGrid, List } from "lucide-react";
import { DroppableColumn } from "./DroppableColumn";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { GhostToast } from "./GhostToast";
import { FilterBar, DEFAULT_FILTERS, type Filters } from "./FilterBar";
import { TableView } from "./TableView";
import { STAGES } from "@/lib/stages";
import { MOCK_APPLICATIONS, type Application } from "@/lib/mock-data";
import { daysSince } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Stage } from "@prisma/client";

type DrawerState =
  | { mode: "closed" }
  | { mode: "edit"; app: Application }
  | { mode: "new"; stage: Stage };

type ViewMode = "kanban" | "table";

const GHOST_THRESHOLD_DAYS = 14;
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SNOOZE_KEY = "jobflow_ghost_snooze";

function getSnoozed(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(SNOOZE_KEY) ?? "{}"); }
  catch { return {}; }
}
function snoozeApp(id: string) {
  const s = getSnoozed(); s[id] = Date.now() + SNOOZE_DURATION_MS;
  localStorage.setItem(SNOOZE_KEY, JSON.stringify(s));
}
function isSnoozed(id: string) {
  const s = getSnoozed(); return !!s[id] && s[id] > Date.now();
}

function applyFilters(apps: Application[], filters: Filters): Application[] {
  const now = Date.now();
  const cutoff = filters.dateRange === "30d" ? now - 30 * 86400000 : filters.dateRange === "90d" ? now - 90 * 86400000 : 0;
  const q = filters.search.toLowerCase();
  return apps.filter((a) => {
    if (filters.starredOnly && !a.isStarred) return false;
    if (filters.source && a.source !== filters.source) return false;
    if (cutoff && new Date(a.createdAt).getTime() < cutoff) return false;
    if (q && !a.company.toLowerCase().includes(q) && !a.roleTitle.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function KanbanBoard() {
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>("kanban");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [draggingApp, setDraggingApp] = useState<Application | null>(null);
  const [ghostQueue, setGhostQueue] = useState<Application[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const buildGhostQueue = useCallback((apps: Application[]) => {
    setGhostQueue(apps.filter(
      (a) => (a.stage === "applied" || a.stage === "interview") &&
        daysSince(a.updatedAt) >= GHOST_THRESHOLD_DAYS && !isSnoozed(a.id)
    ));
  }, []);

  useEffect(() => { buildGhostQueue(applications); }, [applications, buildGhostQueue]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/" ) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "n" || e.key === "N") { e.preventDefault(); setDrawer({ mode: "new", stage: "wishlist" }); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = applyFilters(applications, filters);
  const currentToast = ghostQueue[0] ?? null;

  const grouped = STAGES.reduce<Record<Stage, Application[]>>(
    (acc, s) => { acc[s.slug] = filtered.filter((a) => a.stage === s.slug); return acc; },
    {} as Record<Stage, Application[]>
  );

  const overdueCount = applications.filter((a) => a.followUpDate && new Date(a.followUpDate) < new Date()).length;
  const activeCount = applications.filter((a) => ["applied", "interview", "offer"].includes(a.stage)).length;

  function handleDragStart(e: DragStartEvent) {
    setDraggingApp(applications.find((a) => a.id === e.active.id) ?? null);
  }
  function handleDragEnd(e: DragEndEvent) {
    setDraggingApp(null);
    const { active, over } = e;
    if (!over) return;
    const newStage = over.id as Stage;
    const app = applications.find((a) => a.id === active.id);
    if (!app || app.stage === newStage) return;
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, stage: newStage, updatedAt: new Date() } : a));
  }
  function handleSave(app: Application) {
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      return exists ? prev.map((a) => a.id === app.id ? app : a) : [...prev, app];
    });
  }
  function handleDelete(id: string) { setApplications((prev) => prev.filter((a) => a.id !== id)); }
  function handleGhostAccept(app: Application) {
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, stage: "ghosted", updatedAt: new Date() } : a));
    setGhostQueue((q) => q.filter((a) => a.id !== app.id));
  }
  function handleGhostSnooze(app: Application) {
    snoozeApp(app.id); setGhostQueue((q) => q.filter((a) => a.id !== app.id));
  }

  const drawerApp = drawer.mode === "edit" ? drawer.app : null;
  const drawerStage = drawer.mode === "new" ? drawer.stage : "wishlist";

  return (
    <div className="flex flex-col h-full">
      {/* ── Top header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[13px] font-semibold text-[#f0ede8] tracking-[-0.01em]">Board</h1>
          {/* Stat pills */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-[11px] font-medium text-[#a8a49e] bg-[#252320] px-2 py-0.5 rounded-full tabular-nums">
              {applications.length} apps
            </span>
            {activeCount > 0 && (
              <span className="text-[11px] font-medium text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-full tabular-nums">
                {activeCount} active
              </span>
            )}
            {overdueCount > 0 && (
              <span className="text-[11px] font-medium text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded-full tabular-nums">
                {overdueCount} overdue
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-[#252320] rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView("kanban")}
              title="Kanban view"
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md",
                "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                view === "kanban"
                  ? "bg-[#333028] shadow-[0_1px_3px_rgba(0,0,0,0.3)] text-[#f0ede8]"
                  : "text-[#6b6762] hover:text-[#a8a49e]"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("table")}
              title="Table view"
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md",
                "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                view === "table"
                  ? "bg-[#333028] shadow-[0_1px_3px_rgba(0,0,0,0.3)] text-[#f0ede8]"
                  : "text-[#6b6762] hover:text-[#a8a49e]"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setDrawer({ mode: "new", stage: "wishlist" })}
            className="flex items-center gap-2 bg-orange-600 text-white rounded-full pl-3.5 pr-1.5 h-7 text-[12px] font-semibold hover:bg-orange-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_1px_3px_rgba(234,88,12,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_3px_10px_rgba(234,88,12,0.3)]"
          >
            Add
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-colors hover:bg-white/30">
              <Plus className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>

      {/* ── Filter toolbar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 h-[40px] bg-[#161614] border-b border-[#2d2b27] shrink-0">
        <FilterBar filters={filters} onChange={setFilters} searchRef={searchRef} />
        <span className="text-[11px] text-[#6b6762] hidden lg:flex items-center gap-1 shrink-0">
          <kbd className="px-1.5 py-0.5 bg-[#252320] rounded text-[10px] font-mono border border-[#2d2b27]">N</kbd>
          <kbd className="px-1.5 py-0.5 bg-[#252320] rounded text-[10px] font-mono border border-[#2d2b27]">/</kbd>
        </span>
      </div>

      {/* Board or Table */}
      <div className="flex-1 overflow-auto">
        {view === "kanban" ? (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 px-6 pt-5 pb-6 min-w-max">
              {STAGES.map((s) => (
                <DroppableColumn
                  key={s.slug} {...s}
                  applications={grouped[s.slug]}
                  onCardClick={(app) => setDrawer({ mode: "edit", app })}
                  onAdd={(stage) => setDrawer({ mode: "new", stage })}
                />
              ))}
            </div>
            <DragOverlay>
              {draggingApp && (
                <div className="rotate-1 shadow-xl w-64 opacity-95">
                  <ApplicationCard application={draggingApp} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <TableView
            applications={filtered}
            onRowClick={(app) => setDrawer({ mode: "edit", app })}
            onStageChange={(id, stage) =>
              setApplications((prev) =>
                prev.map((a) => a.id === id ? { ...a, stage, updatedAt: new Date() } : a)
              )
            }
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Ghost toast */}
      {currentToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <GhostToast
            key={currentToast.id}
            company={currentToast.company}
            days={daysSince(currentToast.updatedAt)}
            onAccept={() => handleGhostAccept(currentToast)}
            onDismiss={() => handleGhostSnooze(currentToast)}
          />
        </div>
      )}

      {drawer.mode !== "closed" && (
        <ApplicationDrawer
          key={drawer.mode === "edit" ? drawer.app.id : `new-${drawer.stage}`}
          application={drawerApp}
          isNew={drawer.mode === "new"}
          defaultStage={drawerStage}
          onClose={() => setDrawer({ mode: "closed" })}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
