"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ApplicationCard } from "./ApplicationCard";
import { cn } from "@/lib/utils";
import type { ApplicationView } from "@/lib/types";

interface DraggableCardProps {
  application: ApplicationView;
  onClick: () => void;
  onStarToggle?: (app: ApplicationView) => void;
}

export function DraggableCard({ application, onClick, onStarToggle }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: {
      type: "application",
      stage: application.stage,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-50 z-50 cursor-grabbing")}
      {...listeners}
      {...attributes}
    >
      <ApplicationCard application={application} onClick={onClick} onStarToggle={onStarToggle} />
    </div>
  );
}
