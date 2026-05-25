"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { DraggableCard } from "./DraggableCard";
import { cn } from "@/lib/utils";
import type { ApplicationView } from "@/lib/types";
import type { Stage } from "@prisma/client";

interface DroppableColumnProps {
  slug:         Stage;
  label:        string;
  color:        string;
  dot:          string;
  applications: ApplicationView[];
  onCardClick:  (app: ApplicationView) => void;
  onStarToggle?: (app: ApplicationView) => void;
  onAdd:        (stage: Stage) => void;
  onDrop:       (cardId: string, targetStage: Stage) => void;
  onDragStart:  (id: string) => void;
  onDragEnd:    () => void;
}

const DOT_COLORS: Record<string, string> = {
  wishlist:  "bg-zinc-500",
  applied:   "bg-blue-400",
  interview: "bg-orange-400",
  offer:     "bg-emerald-400",
  rejected:  "bg-red-400",
  ghosted:   "bg-zinc-600",
};

export function DroppableColumn({
  slug,
  label,
  applications,
  onCardClick,
  onStarToggle,
  onAdd,
  onDrop,
  onDragStart,
  onDragEnd,
}: DroppableColumnProps) {
  /**
   * dragCounter tracks how many dragenter events have fired without a matching
   * dragleave. This is the standard fix for the flickering isOver state that
   * occurs when the pointer crosses child elements — each child fires its own
   * dragenter/dragleave pair, which would otherwise toggle isOver rapidly.
   */
  const dragCounter = useRef(0);
  const [isOver, setIsOver] = useState(false);

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsOver(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragLeave() {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsOver(false);
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId) onDrop(cardId, slug);
  }

  return (
    <div className="flex flex-col w-full sm:w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full shrink-0", DOT_COLORS[slug])} />
          <span className="text-[11px] font-semibold text-[#a8a49e] tracking-[-0.01em]">
            {label}
          </span>
          <span className="text-[9px] font-bold text-[#6b6762] bg-[#252320] rounded-full px-1.5 py-0.5 tabular-nums leading-none min-w-[18px] text-center">
            {applications.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(slug)}
          aria-label={`Add to ${label}`}
          className="w-5 h-5 rounded-md flex items-center justify-center text-[#6b6762] hover:text-orange-400 hover:bg-orange-950/30 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/*
       * Drop zone covers the entire column body.
       * dragenter/dragleave counter prevents isOver flickering as the pointer
       * moves across child cards.
       */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "bg-[#181716]/60 ring-1 ring-white/[0.04] rounded-[14px] p-1 flex flex-col flex-1",
          "transition-colors duration-150",
          isOver && "ring-orange-900/40 bg-orange-950/10"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2 flex-1 rounded-[10px] p-0.5 min-h-[160px]",
            "transition-colors duration-150",
            isOver && "bg-orange-950/20 ring-1 ring-orange-900/30 ring-dashed"
          )}
        >
          {applications.map((app) => (
            <DraggableCard
              key={app.id}
              application={app}
              onClick={() => onCardClick(app)}
              onStarToggle={onStarToggle}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}

          {/* Empty state — shown when column has no cards and nothing hovering */}
          {applications.length === 0 && !isOver && (
            <div className="border border-dashed border-[#2d2b27] rounded-xl h-[72px] flex flex-col items-center justify-center gap-1">
              <button
                onClick={() => onAdd(slug)}
                className="w-5 h-5 rounded-full border border-dashed border-[#3a3835] flex items-center justify-center text-[#6b6762] hover:border-orange-600/50 hover:text-orange-400 transition-all duration-300"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
              <p className="text-[10px] text-[#6b6762]">Add application</p>
            </div>
          )}

          {/* Drop indicator — shown when dragging over an empty column */}
          {applications.length === 0 && isOver && (
            <div className="h-[72px] rounded-xl border-2 border-dashed border-orange-700/60 flex items-center justify-center">
              <p className="text-[11px] font-medium text-orange-400">Drop here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
