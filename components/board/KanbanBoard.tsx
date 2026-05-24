"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  DndContext, DragOverlay, PointerSensor, closestCorners,
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
import { daysSince } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getGhostSuggestions } from "@/lib/ghost";
import {
  changeStageAction,
  deleteApplicationAction,
  saveApplicationAction,
  snoozeGhostAction,
  toggleStarAction,
} from "@/app/actions";
import type { ApplicationView, UserSettingsView } from "@/lib/types";
import type { Stage } from "@prisma/client";

type DrawerState =
  | { mode: "closed" }
  | { mode: "edit"; app: ApplicationView }
  | { mode: "new"; stage: Stage };

type ViewMode = "kanban" | "table";

function applyFilters(apps: ApplicationView[], filters: Filters): ApplicationView[] {
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

function getDropStage(event: DragEndEvent): Stage | null {
  const over = event.over;
  if (!over) return null;
  const stage = over.data.current?.stage;
  if (typeof stage === "string") return stage as Stage;
  if (typeof over.id === "string" && over.id.startsWith("column-")) {
    return over.id.replace("column-", "") as Stage;
  }
  return null;
}

function getEventPointer(event: Event, delta?: { x: number; y: number }) {
  const offset = delta ?? { x: 0, y: 0 };
  if ("clientX" in event && "clientY" in event) {
    return {
      x: Number(event.clientX) + offset.x,
      y: Number(event.clientY) + offset.y,
    };
  }
  if ("changedTouches" in event) {
    const touch = (event as TouchEvent).changedTouches[0];
    if (touch) return { x: touch.clientX + offset.x, y: touch.clientY + offset.y };
  }
  return null;
}

export function KanbanBoard({
  initialApplications,
  settings,
  snoozedApplicationIds,
}: {
  initialApplications: ApplicationView[];
  settings: UserSettingsView;
  snoozedApplicationIds: string[];
}) {
  const [applications, setApplications] = useState<ApplicationView[]>(initialApplications);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>("kanban");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [draggingApp, setDraggingApp] = useState<ApplicationView | null>(null);
  const [snoozedIds, setSnoozedIds] = useState(() => new Set(snoozedApplicationIds));
  const [activeMobileStage, setActiveMobileStage] = useState<Stage>("wishlist");
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const columnRefs = useRef(new Map<Stage, HTMLDivElement>());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const registerColumn = useCallback((stage: Stage, node: HTMLDivElement | null) => {
    if (node) columnRefs.current.set(stage, node);
    else columnRefs.current.delete(stage);
  }, []);

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
  const ghostQueue = useMemo(
    () => getGhostSuggestions(applications, settings.ghostThresholdDays, snoozedIds),
    [applications, settings.ghostThresholdDays, snoozedIds]
  );
  const currentToast = ghostQueue[0] ?? null;

  const grouped = STAGES.reduce<Record<Stage, ApplicationView[]>>(
    (acc, s) => { acc[s.slug] = filtered.filter((a) => a.stage === s.slug); return acc; },
    {} as Record<Stage, ApplicationView[]>
  );

  const overdueCount = applications.filter((a) => a.followUpDate && new Date(a.followUpDate) < new Date()).length;
  const activeCount = applications.filter((a) => ["applied", "interview", "offer"].includes(a.stage)).length;

  function handleDragStart(e: DragStartEvent) {
    setDraggingApp(applications.find((a) => a.id === e.active.id) ?? null);
  }
  async function handleDragEnd(e: DragEndEvent) {
    setDraggingApp(null);
    const { active } = e;
    const newStage = getPointerDropStage(e) ?? getDropStage(e);
    if (!newStage) return;
    const app = applications.find((a) => a.id === active.id);
    if (!app || app.stage === newStage) return;
    await handleStageChange(app.id, newStage);
  }
  async function handleSave(app: ApplicationView) {
    const previous = applications;
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      return exists ? prev.map((a) => a.id === app.id ? app : a) : [{ ...app, id: app.id || crypto.randomUUID() }, ...prev];
    });
    const result = await saveApplicationAction(app);
    if (result.ok) {
      setApplications((prev) => {
        const withoutTemp = prev.filter((a) => a.id !== app.id);
        const exists = previous.some((a) => a.id === app.id);
        return exists
          ? prev.map((a) => a.id === app.id ? result.data : a)
          : [result.data, ...withoutTemp];
      });
      setError("");
    } else {
      setApplications(previous);
      setError(result.error);
    }
  }
  async function handleDelete(id: string) {
    const previous = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    const result = await deleteApplicationAction(id);
    if (!result.ok) {
      setApplications(previous);
      setError(result.error);
    }
  }
  async function handleStageChange(id: string, stage: Stage) {
    const previous = applications;
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, stage, updatedAt: new Date().toISOString() } : a));
    const result = await changeStageAction(id, stage);
    if (result.ok) {
      setApplications((prev) => prev.map((a) => a.id === id ? result.data : a));
      setError("");
    } else {
      setApplications(previous);
      setError(result.error);
    }
  }
  async function handleStarToggle(app: ApplicationView) {
    const previous = applications;
    const nextStarred = !app.isStarred;
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, isStarred: nextStarred } : a));
    const result = await toggleStarAction(app.id, nextStarred);
    if (result.ok) {
      setApplications((prev) => prev.map((a) => a.id === app.id ? result.data : a));
      setError("");
    } else {
      setApplications(previous);
      setError(result.error);
    }
  }
  async function handleGhostAccept(app: ApplicationView) {
    await handleStageChange(app.id, "ghosted");
  }
  async function handleGhostSnooze(app: ApplicationView) {
    setSnoozedIds((prev) => new Set(prev).add(app.id));
    const result = await snoozeGhostAction(app.id);
    if (!result.ok) setError(result.error);
  }

  function getPointerDropStage(event: DragEndEvent): Stage | null {
    const pointer = getEventPointer(event.activatorEvent, event.delta);
    if (!pointer) return null;
    for (const stage of STAGES) {
      const node = columnRefs.current.get(stage.slug);
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (
        pointer.x >= rect.left &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom
      ) {
        return stage.slug;
      }
    }
    return null;
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
      <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2 sm:py-0 sm:min-h-[40px] bg-[#161614] border-b border-[#2d2b27] shrink-0">
        <FilterBar filters={filters} onChange={setFilters} searchRef={searchRef} />
        <span className="text-[11px] text-[#6b6762] hidden lg:flex items-center gap-1 shrink-0">
          <kbd className="px-1.5 py-0.5 bg-[#252320] rounded text-[10px] font-mono border border-[#2d2b27]">N</kbd>
          <kbd className="px-1.5 py-0.5 bg-[#252320] rounded text-[10px] font-mono border border-[#2d2b27]">/</kbd>
        </span>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-red-300 bg-red-950/40 border-b border-red-900/40">
          {error}
        </div>
      )}

      {/* Board or Table */}
      <div className="flex-1 overflow-auto">
        {view === "kanban" ? (
          <DndContext
            id="jobflow-board-dnd"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="sm:hidden sticky top-0 z-10 bg-[#111110] border-b border-[#2d2b27] px-3 py-2 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {STAGES.map((stage) => (
                  <button
                    key={stage.slug}
                    onClick={() => setActiveMobileStage(stage.slug)}
                    className={cn(
                      "h-9 px-3 rounded-full text-xs font-semibold border flex items-center gap-1.5",
                      activeMobileStage === stage.slug
                        ? "bg-orange-950/50 border-orange-900/60 text-orange-400"
                        : "bg-[#1c1b19] border-[#2d2b27] text-[#a8a49e]"
                    )}
                  >
                    {stage.label}
                    <span className="text-[10px] text-[#6b6762]">{grouped[stage.slug].length}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex gap-4 px-6 pt-5 pb-6 min-w-max">
              {STAGES.map((s) => (
                <DroppableColumn
                  key={s.slug} {...s}
                  applications={grouped[s.slug]}
                  onCardClick={(app) => setDrawer({ mode: "edit", app })}
                  onStarToggle={handleStarToggle}
                  registerColumn={registerColumn}
                  onAdd={(stage) => setDrawer({ mode: "new", stage })}
                />
              ))}
            </div>
            <div className="sm:hidden px-3 py-3 pb-24">
              {STAGES.filter((stage) => stage.slug === activeMobileStage).map((s) => (
                <DroppableColumn
                  key={s.slug} {...s}
                  applications={grouped[s.slug]}
                  onCardClick={(app) => setDrawer({ mode: "edit", app })}
                  onStarToggle={handleStarToggle}
                  registerColumn={registerColumn}
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
              handleStageChange(id, stage)
            }
            onDelete={handleDelete}
            onStarToggle={handleStarToggle}
          />
        )}
      </div>

      {/* Ghost toast */}
      {currentToast && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 z-50">
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
