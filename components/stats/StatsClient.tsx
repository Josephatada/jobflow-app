"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  filterByRange, byStage, responseRate, weeklyVolume,
  topSources, funnel, avgDaysInStage, type DateRange,
} from "@/lib/stats";
import { cn } from "@/lib/utils";
import type { ApplicationView } from "@/lib/types";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-5">
      <p className="text-xs text-[#6b6762] font-medium">{label}</p>
      <p className="text-2xl font-bold text-[#f0ede8] mt-1">{value}</p>
      {sub && <p className="text-xs text-[#6b6762] mt-1">{sub}</p>}
    </div>
  );
}


function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-5">
      <p className="text-sm font-semibold text-[#f0ede8] mb-4">{title}</p>
      {children}
    </div>
  );
}

export function StatsClient({ applications }: { applications: ApplicationView[] }) {
  const [mounted] = useState(true);
  const [range, setRange] = useState<DateRange>("all");
  const apps = filterByRange(applications, range);

  const stageData = byStage(apps);
  const rate = responseRate(apps);
  const weekly = weeklyVolume(apps);
  const sources = topSources(apps);
  const funnelData = funnel(apps);
  const avgDays = avgDaysInStage(apps);

  const totalApps = apps.length;
  const activeApps = apps.filter((a) => ["applied", "interview", "offer"].includes(a.stage)).length;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <h1 className="text-[13px] font-semibold text-[#f0ede8] tracking-[-0.01em]">Stats</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4 pb-24 sm:pb-4">

        {/* Date range filter */}
        <div className="flex items-center gap-1 bg-[#252320] rounded-lg p-0.5 w-fit">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-2.5 h-7 text-[11px] font-medium rounded-md transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap",
                range === r.value
                  ? "bg-[#333028] text-[#f0ede8] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                  : "text-[#6b6762] hover:text-[#a8a49e]"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total applications" value={totalApps} />
          <StatCard label="Active pipeline" value={activeApps} sub="Applied + Interview + Offer" />
          <StatCard label="Response rate" value={`${rate}%`} sub="Applied → Interview or beyond" />
          <StatCard
            label="Avg days to next stage"
            value={avgDays[0] ? `${avgDays[0].days}d` : "—"}
            sub={avgDays[0]?.stage}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Applications by stage">
            {stageData.length && mounted ? (
              <div className="flex flex-col items-center">
                <PieChart width={220} height={200}>
                  <Pie
                    data={stageData}
                    cx={110}
                    cy={100}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    isAnimationActive={false}
                  >
                    {stageData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [v, name]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #2d2b27", background: "#1c1b19", fontSize: 12, color: "#f0ede8" }}
                  />
                </PieChart>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
                  {stageData.map((s) => (
                    <div key={s.slug} className="flex items-center gap-1.5 text-xs text-[#a8a49e]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      {s.name} <span className="text-[#6b6762]">({s.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-sm text-[#6b6762] py-8 text-center">No data</p>}
          </ChartCard>

          <ChartCard title="Application volume (weekly)">
            {weekly.length && mounted ? (
              <div className="w-full" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2b27" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6b6762" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b6762" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #2d2b27", background: "#1c1b19", fontSize: 12, color: "#f0ede8" }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#e8510a"
                    strokeWidth={2}
                    dot={{ fill: "#e8510a", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-[#6b6762] py-8 text-center">No data</p>}
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Top sources">
            {sources.length ? (
              <div className="flex flex-col gap-3">
                {sources.map((s) => {
                  const max = sources[0].applied || 1;
                  const appliedPct = Math.round((s.applied / max) * 100);
                  const interviewPct = Math.round((s.interview / max) * 100);
                  return (
                    <div key={s.source} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#a8a49e] capitalize">{s.source}</span>
                        <span className="text-[11px] text-[#6b6762] tabular-nums">{s.applied} applied · {s.interview} interviews</span>
                      </div>
                      <div className="relative h-2 bg-[#252320] rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-blue-900 rounded-full"
                          style={{ width: `${appliedPct}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 bg-orange-500 rounded-full"
                          style={{ width: `${interviewPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#6b6762]">
                    <span className="w-2 h-2 rounded-full bg-blue-900 shrink-0" /> Applied
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-[#6b6762]">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> Interview+
                  </span>
                </div>
              </div>
            ) : <p className="text-sm text-[#6b6762] py-8 text-center">No data</p>}
          </ChartCard>

          <ChartCard title="Win / loss funnel">
            {funnelData.some((f) => f.value > 0) ? (
              <div className="flex flex-col items-center gap-2 py-2" style={{ height: 200, justifyContent: "center" }}>
                {funnelData.map((item, i) => {
                  const maxVal = funnelData[0].value || 1;
                  const pct = Math.max(20, Math.round((item.value / maxVal) * 100));
                  const colors = ["#1e3a5f", "#fb923c", "#4ade80"];
                  const convPct = i === 0 ? 100 : Math.round((item.value / funnelData[0].value) * 100);
                  return (
                    <div key={i} className="flex flex-col items-center w-full">
                      <div
                        className="flex items-center justify-center rounded text-xs font-medium text-white transition-all"
                        style={{ width: `${pct}%`, background: colors[i] ?? "#2d2b27", height: 40 }}
                      >
                        {item.name} — {item.value} ({convPct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-[#6b6762] py-8 text-center">No data</p>}
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
