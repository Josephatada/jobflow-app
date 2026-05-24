"use client";

import { useState } from "react";
import { X, Star, Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn, formatDate } from "@/lib/utils";
import { STAGES, STAGE_MAP } from "@/lib/stages";
import { InterviewRounds } from "./InterviewRounds";
import type { ApplicationView } from "@/lib/types";
import type { Stage, Source } from "@prisma/client";

const SOURCES: { value: Source; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral" },
  { value: "company_site", label: "Company Site" },
  { value: "job_board", label: "Job Board" },
  { value: "other", label: "Other" },
];

const INPUT_CLS =
  "bg-[#252320] border border-[#2d2b27] text-[#f0ede8] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600/50 w-full";

const MOBILE_STAGE_HELP =
  "Use this stage picker to move the job between Saved, Applied, Interview, Offer, Rejected, and Ghosted.";

interface ApplicationDrawerProps {
  application: ApplicationView | null;
  isNew?: boolean;
  defaultStage?: Stage;
  onClose: () => void;
  onSave: (app: ApplicationView) => void;
  onDelete: (id: string) => void;
}

function emptyApp(stage: Stage = "wishlist"): ApplicationView {
  const now = new Date().toISOString();
  return {
    id: `new-${crypto.randomUUID()}`,
    company: "",
    roleTitle: "",
    jobUrl: null,
    location: null,
    source: null,
    dateApplied: null,
    contactName: null,
    contactEmail: null,
    salaryRange: null,
    stage,
    followUpDate: null,
    isStarred: false,
    notes: null,
    createdAt: now,
    updatedAt: now,
    interviewRounds: [],
  };
}

export function ApplicationDrawer({
  application,
  isNew = false,
  defaultStage = "wishlist",
  onClose,
  onSave,
  onDelete,
}: ApplicationDrawerProps) {
  const [form, setForm] = useState<ApplicationView>(
    application ?? emptyApp(defaultStage)
  );
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<{ jobUrl?: string }>({});

  function set<K extends keyof ApplicationView>(key: K, value: ApplicationView[K]) {
    setForm((prev) => ({ ...prev, [key]: value === "" ? null : value }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.jobUrl?.trim()) e.jobUrl = "Required";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, updatedAt: new Date().toISOString() });
    onClose();
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(form.id);
    onClose();
  }

  async function handleCopyUrl() {
    if (!form.jobUrl) return;
    try {
      await navigator.clipboard.writeText(form.jobUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function handleQuickStage(stage: Stage) {
    setForm((prev) => ({ ...prev, stage, updatedAt: new Date().toISOString() }));
  }

  const stageInfo = STAGES.find((s) => s.slug === form.stage);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="bg-[#1c1b19] border border-[#2d2b27] rounded-t-2xl sm:rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] w-full sm:max-w-[560px] h-[82dvh] max-h-[720px] sm:h-auto sm:max-h-[85vh] flex flex-col sm:mx-4 animate-[fadeScaleIn_0.18s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2b27] px-4 sm:px-6 py-4 pt-[max(1rem,env(safe-area-inset-top))] shrink-0">
          <div className="flex items-center gap-2">
            {isNew ? (
              <span className="text-[13px] font-semibold text-[#f0ede8]">New Application</span>
            ) : (
              <>
                <span className={cn("w-2 h-2 rounded-full", stageInfo?.dot)} />
                <span className="text-[13px] font-semibold text-[#f0ede8]">
                  {form.company || "Application"}
                </span>
                <span className={cn("text-[11px] font-medium", stageInfo?.color)}>
                  · {stageInfo?.label}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => set("isStarred", !form.isStarred)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                form.isStarred
                  ? "text-orange-500 bg-orange-950/50"
                  : "text-[#6b6762] hover:text-orange-400 hover:bg-orange-950/30"
              )}
              title="Star"
            >
              <Star className={cn("w-4 h-4", form.isStarred && "fill-orange-500")} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6762] hover:text-[#f0ede8] hover:bg-[#2d2b27] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-5 flex-1 space-y-5">
          {/* Stage pipeline (edit mode) */}
          {!isNew && (
            <StagePipeline currentStage={form.stage} />
          )}

          {/* Company + Role */}
          <div className="space-y-3">
            <Input
              id="company"
              label="Company"
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              placeholder="e.g. Stripe"
            />
            <Input
              id="roleTitle"
              label="Role title"
              value={form.roleTitle}
              onChange={(e) => setForm((p) => ({ ...p, roleTitle: e.target.value }))}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          {/* Stage */}
          <Select
            id="stage"
            label="Stage"
            value={form.stage}
            onChange={(e) => set("stage", e.target.value as Stage)}
          >
            {STAGES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </Select>
          <p className="sm:hidden -mt-3 text-[11px] leading-relaxed text-[#6b6762]">
            {MOBILE_STAGE_HELP}
          </p>

          <div className="sm:hidden grid grid-cols-3 gap-1.5">
            {STAGES.map((stage) => (
              <button
                key={stage.slug}
                type="button"
                onClick={() => handleQuickStage(stage.slug)}
                className={cn(
                  "min-h-10 rounded-lg border px-2 text-[11px] font-semibold",
                  form.stage === stage.slug
                    ? "border-orange-900/60 bg-orange-950/50 text-orange-400"
                    : "border-[#2d2b27] bg-[#252320] text-[#a8a49e]"
                )}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          {form.stage !== "rejected" && form.stage !== "ghosted" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickStage("rejected")}
                className="text-xs px-3 py-1.5 rounded-full border border-red-900/50 text-red-400 hover:bg-red-950/40 transition-colors"
              >
                Mark Rejected
              </button>
              <button
                type="button"
                onClick={() => handleQuickStage("ghosted")}
                className="text-xs px-3 py-1.5 rounded-full border border-[#2d2b27] text-[#6b6762] hover:bg-[#252320] transition-colors"
              >
                Mark Ghosted
              </button>
            </div>
          )}

          {/* Job URL */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#a8a49e]">Job URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.jobUrl ?? ""}
                onChange={(e) => set("jobUrl", e.target.value as ApplicationView["jobUrl"])}
                placeholder="https://..."
                className={cn(INPUT_CLS, errors.jobUrl && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20")}
              />
              <div className="flex gap-1">
                {form.jobUrl && (
                  <a
                    href={form.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#2d2b27] text-[#6b6762] hover:text-orange-400 hover:border-orange-900/50 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {form.jobUrl && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#2d2b27] text-[#6b6762] hover:text-orange-400 hover:border-orange-900/50 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            {errors.jobUrl && <p className="text-xs text-red-400">{errors.jobUrl}</p>}
          </div>

          {/* Row: Location + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="location"
              label="Location"
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value as ApplicationView["location"])}
              placeholder="Remote"
            />
            <Select
              id="source"
              label="Source"
              value={form.source ?? ""}
              onChange={(e) => set("source", (e.target.value || null) as ApplicationView["source"])}
            >
              <option value="">—</option>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>

          {/* Row: Date applied + Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="dateApplied"
              label="Date applied"
              type="date"
              value={form.dateApplied ? new Date(form.dateApplied).toISOString().split("T")[0] : ""}
              onChange={(e) => set("dateApplied", e.target.value ? new Date(e.target.value).toISOString() as ApplicationView["dateApplied"] : null)}
            />
            <Input
              id="followUpDate"
              label="Follow-up date"
              type="date"
              value={form.followUpDate ? new Date(form.followUpDate).toISOString().split("T")[0] : ""}
              onChange={(e) => set("followUpDate", e.target.value ? new Date(e.target.value).toISOString() as ApplicationView["followUpDate"] : null)}
            />
          </div>

          {/* Row: Contact name + email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="contactName"
              label="Contact name"
              value={form.contactName ?? ""}
              onChange={(e) => set("contactName", e.target.value as ApplicationView["contactName"])}
              placeholder="Recruiter / HM"
            />
            <Input
              id="contactEmail"
              label="Contact email"
              type="email"
              value={form.contactEmail ?? ""}
              onChange={(e) => set("contactEmail", e.target.value as ApplicationView["contactEmail"])}
              placeholder="name@company.com"
            />
          </div>

          {/* Salary */}
          <Input
            id="salaryRange"
            label="Salary range"
            value={form.salaryRange ?? ""}
            onChange={(e) => set("salaryRange", e.target.value as ApplicationView["salaryRange"])}
            placeholder="e.g. $140k–$180k"
          />

          {/* Interview rounds — only when stage is interview */}
          {form.stage === "interview" && (
            <InterviewRounds
              rounds={form.interviewRounds}
              applicationId={form.id}
              onChange={(rounds) => setForm((p) => ({ ...p, interviewRounds: rounds }))}
            />
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#a8a49e]">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value as ApplicationView["notes"])}
              rows={4}
              placeholder="Interview prep, talking points, salary notes…"
              className={cn(INPUT_CLS, "resize-none")}
            />
          </div>

          {/* Meta */}
          {!isNew && (
            <p className="text-xs text-[#6b6762]">
              Created {formatDate(form.createdAt)} · Updated {formatDate(form.updatedAt)}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#2d2b27] px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between shrink-0">
          {!isNew ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? "Confirm delete" : "Delete"}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {isNew ? "Add application" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stage pipeline breadcrumb shown in modal header area
const PIPELINE_STAGES = ["wishlist", "applied", "interview", "offer"] as const;

function StagePipeline({ currentStage }: { currentStage: Stage }) {
  const isTerminal = currentStage === "rejected" || currentStage === "ghosted";
  const currentInfo = STAGE_MAP[currentStage];
  const activeIdx = PIPELINE_STAGES.indexOf(currentStage as typeof PIPELINE_STAGES[number]);

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {isTerminal ? (
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
          currentStage === "rejected" ? "bg-red-950/50 text-red-400" : "bg-[#252320] text-[#6b6762]"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", currentInfo?.dot)} />
          {currentInfo?.label}
        </div>
      ) : (
        PIPELINE_STAGES.map((s, i) => {
          const info = STAGE_MAP[s];
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <div key={s} className="flex items-center">
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors",
                active && "bg-orange-950/50 text-orange-400",
                done && "text-[#6b6762]",
                !active && !done && "text-[#3a3835]"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  active ? info.dot : done ? "bg-[#3a3835]" : "bg-[#252320]"
                )} />
                {info.label}
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <span className={cn("mx-0.5 text-[#3a3835] text-xs", done && "text-[#6b6762]")}>›</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
