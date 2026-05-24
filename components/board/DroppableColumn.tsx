"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { DraggableCard } from "./DraggableCard";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/mock-data";
import type { Stage } from "@prisma/client";

interface DroppableColumnProps {
  slug:         Stage;
  label:        string;
  color:        string;
  dot:          string;
  applications: Application[];
  onCardClick:  (app: Application) => void;
  onAdd:        (stage: Stage) => void;
}

const DOT_COLORS: Record<string, string> = {
  wishlist:  "bg-zinc-500",
  applied:   "bg-blue-400",
  interview: "bg-orange-400",
  offer:     "bg-emerald-400",
  rejected:  "bg-red-400",
  ghosted:   "bg-zinc-600",
};

export function DroppableColumn({ slug, label, applications, onCardClick, onAdd }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: slug });

  return (
    <div className="flex flex-col w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full shrink-0", DOT_COLORS[slug])} />
          <span className="text-[11px] font-semibold text-[#a8a49e] tracking-[-0.01em]">{label}</span>
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

      {/* Outer shell */}
      <div className="bg-[#181716]/60 ring-1 ring-white/[0.04] rounded-[14px] p-1">
        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-2 min-h-[80px] rounded-[10px] p-0.5 transition-all duration-300",
            isOver && "bg-orange-950/20 ring-1 ring-orange-900/30 ring-dashed"
          )}
        >
          {applications.map((app) => (
            <DraggableCard
              key={app.id}
              application={app}
              onClick={() => onCardClick(app)}
            />
          ))}

          {applications.length === 0 && (
            <div className={cn(
              "border border-dashed rounded-xl h-20 flex flex-col items-center justify-center gap-1 transition-all duration-300",
              isOver ? "border-orange-800 bg-orange-950/20" : "border-[#2d2b27]"
            )}>
              {isOver ? (
                <p className="text-[11px] font-medium text-orange-400">Drop here</p>
              ) : (
                <>
                  <button
                    onClick={() => onAdd(slug)}
                    className="w-5 h-5 rounded-full border border-dashed border-[#3a3835] flex items-center justify-center text-[#6b6762] hover:border-orange-600/50 hover:text-orange-400 transition-all duration-300"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <p className="text-[10px] text-[#6b6762]">Add application</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
