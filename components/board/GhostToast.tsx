"use client";

import { Ghost, X, Check } from "lucide-react";

interface GhostToastProps {
  company: string;
  days: number;
  onAccept: () => void;
  onDismiss: () => void;
}

export function GhostToast({ company, days, onAccept, onDismiss }: GhostToastProps) {
  return (
    <div className="flex items-start gap-3 bg-[#1c1b19] border border-[#2d2b27] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-4 py-3.5 w-full sm:w-[320px]">
      <div className="w-8 h-8 rounded-xl bg-[#252320] flex items-center justify-center shrink-0 mt-0.5">
        <Ghost className="w-3.5 h-3.5 text-[#6b6762]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#f0ede8] tracking-tight">No activity on {company}</p>
        <p className="text-xs text-[#6b6762] mt-0.5 leading-snug">
          {days} days with no update — mark as Ghosted?
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#f0ede8] text-[#111110] rounded-full hover:bg-white transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          >
            <Check className="w-3 h-3" />
            Mark Ghosted
          </button>
          <button
            onClick={onDismiss}
            className="text-xs font-medium px-3 py-1.5 text-[#6b6762] hover:text-[#a8a49e] hover:bg-[#252320] rounded-full transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
          >
            Snooze 7d
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-[#6b6762] hover:text-[#a8a49e] transition-colors mt-0.5 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
