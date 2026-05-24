"use client";

import { Search, Star, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "@prisma/client";
import type { RefObject } from "react";

export type Filters = {
  search:     string;
  source:     Source | "";
  starredOnly: boolean;
  dateRange:  "all" | "30d" | "90d";
};

export const DEFAULT_FILTERS: Filters = {
  search:      "",
  source:      "",
  starredOnly: false,
  dateRange:   "all",
};

const SOURCES: { value: Source | ""; label: string }[] = [
  { value: "",             label: "All sources" },
  { value: "linkedin",     label: "LinkedIn" },
  { value: "referral",     label: "Referral" },
  { value: "company_site", label: "Company Site" },
  { value: "job_board",    label: "Job Board" },
  { value: "other",        label: "Other" },
];

const DATE_RANGES: { value: Filters["dateRange"]; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

interface FilterBarProps {
  filters:   Filters;
  onChange:  (f: Filters) => void;
  searchRef?: RefObject<HTMLInputElement | null>;
}

const chipBase = [
  "h-7 px-2.5 flex items-center gap-1.5 rounded-md border text-[12px] font-medium",
  "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] cursor-pointer",
].join(" ");

const chipIdle   = "bg-[#1c1b19] border-[#2d2b27] text-[#a8a49e] hover:border-[#3a3835] hover:text-[#f0ede8] hover:bg-[#252320]";
const chipActive = "bg-orange-950/40 border-orange-900/50 text-orange-400";

export function FilterBar({ filters, onChange, searchRef }: FilterBarProps) {
  const hasActive =
    filters.search || filters.source || filters.starredOnly || filters.dateRange !== "all";

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6b6762] pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className={cn(
            "h-7 pl-7 pr-7 text-[12px] rounded-md border border-[#2d2b27] bg-[#1c1b19]",
            "text-[#f0ede8] placeholder:text-[#6b6762]",
            "focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600/50 focus:bg-[#1c1b19]",
            "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
            "w-[180px] focus:w-[220px]"
          )}
        />
        {filters.search && (
          <button
            onClick={() => set("search", "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6762] hover:text-[#a8a49e]"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Divider */}
      <span className="w-px h-4 bg-[#2d2b27] shrink-0" />

      {/* Source */}
      <select
        value={filters.source}
        onChange={(e) => set("source", e.target.value as Source | "")}
        className={cn(
          chipBase,
          filters.source ? chipActive : chipIdle,
          "appearance-none pr-2"
        )}
      >
        {SOURCES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Date range */}
      <select
        value={filters.dateRange}
        onChange={(e) => set("dateRange", e.target.value as Filters["dateRange"])}
        className={cn(
          chipBase,
          filters.dateRange !== "all" ? chipActive : chipIdle,
          "appearance-none pr-2"
        )}
      >
        {DATE_RANGES.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      {/* Starred */}
      <button
        onClick={() => set("starredOnly", !filters.starredOnly)}
        className={cn(chipBase, filters.starredOnly ? chipActive : chipIdle)}
      >
        <Star className={cn("w-3 h-3", filters.starredOnly && "fill-orange-400")} />
        Starred
      </button>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="h-7 px-2 text-[11px] font-medium text-[#6b6762] hover:text-[#a8a49e] hover:bg-[#252320] rounded-md transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
