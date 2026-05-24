import { Star, Calendar } from "lucide-react";
import { cn, daysSince, isOverdue, formatDate } from "@/lib/utils";
import { STAGE_MAP } from "@/lib/stages";
import type { ApplicationView } from "@/lib/types";

interface ApplicationCardProps {
  application: ApplicationView;
  onClick: () => void;
  onStarToggle?: (app: ApplicationView) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  linkedin:     "LinkedIn",
  referral:     "Referral",
  company_site: "Company",
  job_board:    "Job Board",
  other:        "Other",
};

const AVATAR_COLORS = [
  ["bg-zinc-800",     "text-zinc-400"],
  ["bg-blue-950",     "text-blue-400"],
  ["bg-violet-950",   "text-violet-400"],
  ["bg-emerald-950",  "text-emerald-400"],
  ["bg-amber-950",    "text-amber-400"],
  ["bg-rose-950",     "text-rose-400"],
];

function getAvatarStyle(company: string): [string, string] {
  const idx = (company || "J").charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] as [string, string];
}

export function ApplicationCard({ application, onClick, onStarToggle }: ApplicationCardProps) {
  const { company, roleTitle, isStarred, followUpDate, updatedAt, stage, source } = application;
  const companyLabel = company || "Untitled application";
  const roleLabel = roleTitle || "No role title";
  const days    = daysSince(updatedAt);
  const overdue = isOverdue(followUpDate);
  const stageInfo = STAGE_MAP[stage];
  const [avatarBg, avatarText] = getAvatarStyle(companyLabel);

  return (
    // Outer shell (double-bezel)
    <div
      onClick={onClick}
      className={cn(
        "bg-[#252320]/60 ring-1 ring-white/[0.04] p-1.5 rounded-[18px] cursor-pointer select-none group",
        "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:ring-white/[0.08] hover:-translate-y-[1px] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
      )}
    >
      {/* Inner core */}
      <div className={cn(
        "bg-[#1c1b19] rounded-[13px] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-shadow duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
      )}>
        {/* Row 1: Avatar + stage dot + star */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {/* Company avatar */}
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", avatarBg)}>
              <span className={cn("text-[9px] font-bold", avatarText)}>{companyLabel.slice(0, 2).toUpperCase()}</span>
            </div>
            {/* Stage: dot + text, no background */}
            <span className="inline-flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stageInfo?.dot)} />
              <span className={cn(
                "text-[10px] font-semibold",
                stage === "wishlist"  && "text-zinc-400",
                stage === "applied"   && "text-blue-400",
                stage === "interview" && "text-orange-400",
                stage === "offer"     && "text-emerald-400",
                stage === "rejected"  && "text-red-400",
                stage === "ghosted"   && "text-zinc-500",
              )}>
                {stageInfo?.label}
              </span>
            </span>
          </div>

          {/* Star — visible on hover or if starred */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStarToggle?.(application);
            }}
            className={cn(
              "min-h-7 min-w-7 flex items-center justify-center rounded-md transition-opacity duration-300",
              isStarred ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            )}
            aria-label={isStarred ? "Unstar application" : "Star application"}
          >
            <Star className={cn(
              "w-3 h-3 transition-colors",
              isStarred ? "text-orange-400 fill-orange-400" : "text-[#6b6762] hover:text-orange-400"
            )} />
          </button>
        </div>

        {/* Row 2: Company + role */}
        <div className="mb-3">
          <p className="text-[13px] font-semibold text-[#f0ede8] leading-snug tracking-[-0.02em]">{companyLabel}</p>
          <p className="text-[11px] text-[#6b6762] mt-0.5 leading-snug line-clamp-1">{roleLabel}</p>
        </div>

        {/* Row 3: source + follow-up/time */}
        <div className="flex items-center justify-between gap-2">
          {source ? (
            <span className="text-[10px] font-medium text-[#6b6762] bg-[#252320] ring-1 ring-white/[0.05] px-1.5 py-0.5 rounded-md">
              {SOURCE_LABELS[source] ?? source}
            </span>
          ) : <span />}

          {followUpDate ? (
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-medium",
              overdue ? "text-red-400" : "text-orange-400"
            )}>
              <Calendar className="w-2.5 h-2.5 shrink-0" />
              {formatDate(followUpDate)}
            </span>
          ) : (
            <span className="text-[10px] text-[#6b6762]">
              {days === 0 ? "Today" : `${days}d ago`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
