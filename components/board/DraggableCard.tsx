"use client";

import { useRef } from "react";
import { ApplicationCard } from "./ApplicationCard";
import type { ApplicationView } from "@/lib/types";

interface DraggableCardProps {
  application: ApplicationView;
  onClick: () => void;
  onStarToggle?: (app: ApplicationView) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export function DraggableCard({
  application,
  onClick,
  onStarToggle,
  onDragStart,
  onDragEnd,
}: DraggableCardProps) {
  const elRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={elRef}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", application.id);
        e.dataTransfer.effectAllowed = "move";
        // Defer opacity change so the browser can capture the drag ghost first
        requestAnimationFrame(() => {
          if (elRef.current) elRef.current.style.opacity = "0.25";
        });
        onDragStart(application.id);
      }}
      onDragEnd={() => {
        if (elRef.current) elRef.current.style.opacity = "1";
        onDragEnd();
      }}
      className="cursor-grab active:cursor-grabbing select-none"
    >
      <ApplicationCard
        application={application}
        onClick={onClick}
        onStarToggle={onStarToggle}
      />
    </div>
  );
}
