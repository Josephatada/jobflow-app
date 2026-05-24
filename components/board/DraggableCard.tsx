"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ApplicationCard } from "./ApplicationCard";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/mock-data";

interface DraggableCardProps {
  application: Application;
  onClick: () => void;
}

export function DraggableCard({ application, onClick }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-50 z-50 cursor-grabbing")}
      {...listeners}
      {...attributes}
    >
      <ApplicationCard application={application} onClick={onClick} />
    </div>
  );
}
