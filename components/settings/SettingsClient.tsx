"use client";

import { useState } from "react";
import { Check, Ghost, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";
import { updateSettingsAction } from "@/app/actions";
import type { UserSettingsView } from "@/lib/types";

function SaveBadge({ saved }: { saved: boolean }) {
  return (
    <span className={cn(
      "flex items-center gap-1 text-xs font-medium text-green-400 transition-all duration-300",
      saved ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
    )}>
      <Check className="w-3.5 h-3.5" /> Saved
    </span>
  );
}

export function SettingsClient({ settings, email }: { settings: UserSettingsView; email: string }) {
  const [ghostThreshold, setGhostThreshold] = useState(String(settings.ghostThresholdDays));
  const [emailDigest, setEmailDigest] = useState(settings.emailDigestEnabled);
  const [ghostSaved, setGhostSaved] = useState(false);
  const [error, setError] = useState("");

  async function saveSettings(nextDigest = emailDigest) {
    const val = parseInt(ghostThreshold);
    if (!isNaN(val) && val > 0) {
      const result = await updateSettingsAction({
        ghostThresholdDays: val,
        emailDigestEnabled: nextDigest,
      });
      if (result.ok) {
        setEmailDigest(result.data.emailDigestEnabled);
        setGhostThreshold(String(result.data.ghostThresholdDays));
        setGhostSaved(true);
        setError("");
        setTimeout(() => setGhostSaved(false), 2000);
      } else {
        setError(result.error);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <h1 className="text-[13px] font-semibold text-[#f0ede8] tracking-[-0.01em]">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-start pb-20 sm:pb-0">

          {/* Left column */}
          <div className="space-y-4">
            {/* Account card */}
            <div className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#252320]">
                <p className="text-[11px] font-semibold text-[#6b6762] uppercase tracking-widest">Account</p>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-950 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-orange-400">J</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f0ede8] break-all">{email}</p>
                    <p className="text-xs text-[#6b6762] mt-0.5">Personal account · Single user</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6b6762]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure</span>
                </div>
              </div>
            </div>

            {/* Ghost suggestion */}
            <div className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#252320]">
                <p className="text-[11px] font-semibold text-[#6b6762] uppercase tracking-widest">Ghost Suggestion</p>
              </div>
              <div className="px-5 py-4 space-y-4">
                <p className="text-xs text-[#a8a49e] leading-relaxed">
                  After how many days of inactivity should JobFlow suggest marking an application as Ghosted?
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#252320] border border-[#2d2b27] rounded-lg px-3 h-9">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={ghostThreshold}
                      onChange={(e) => setGhostThreshold(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveSettings()}
                      className="w-10 bg-transparent text-sm font-semibold text-[#f0ede8] focus:outline-none text-center"
                    />
                    <span className="text-xs text-[#6b6762]">days</span>
                  </div>
                  <Button size="sm" onClick={() => saveSettings()}>Save</Button>
                  <SaveBadge saved={ghostSaved} />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex items-start gap-2.5 p-3 bg-[#1a1917] border border-[#2d2b27] rounded-lg">
                  <Ghost className="w-3.5 h-3.5 text-[#6b6762] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#a8a49e] leading-relaxed">
                    Applications in <span className="font-medium text-[#f0ede8]">Applied</span> or <span className="font-medium text-[#f0ede8]">Interview</span> with no stage change for <span className="font-medium text-[#f0ede8]">{ghostThreshold || "—"} days</span> will show a suggestion toast. Snoozing delays it by 7 days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Notifications */}
            <div className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#252320]">
                <p className="text-[11px] font-semibold text-[#6b6762] uppercase tracking-widest">Notifications</p>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#252320] flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5 text-[#6b6762]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#f0ede8]">Weekly email digest</p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#252320] text-[#6b6762] rounded-full">v1.1</span>
                      </div>
                      <p className="text-xs text-[#6b6762] mt-0.5">Summary of active applications and overdue follow-ups sent every Monday</p>
                    </div>
                  </div>
                  <Toggle
                    checked={emailDigest}
                    onChange={(checked) => {
                      setEmailDigest(checked);
                      saveSettings(checked);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#252320]">
                <p className="text-[11px] font-semibold text-[#6b6762] uppercase tracking-widest">About</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6b6762]">Version</span>
                  <span className="text-xs font-medium text-[#a8a49e]">v1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6b6762]">Stack</span>
                  <span className="text-xs font-medium text-[#a8a49e]">Next.js · Prisma · Supabase</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6b6762]">Built for</span>
                  <span className="text-xs font-medium text-[#a8a49e]">Joseph</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
