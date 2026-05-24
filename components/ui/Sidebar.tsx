"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, BarChart2, Settings, Briefcase, ChevronLeft, ChevronRight, AlignLeft } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/board",    label: "Board",    icon: LayoutGrid },
  { href: "/summary",  label: "Summary",  icon: AlignLeft },
  { href: "/stats",    label: "Stats",    icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "hidden md:flex flex-col h-screen bg-[#1c1b19] border-r border-[#2d2b27] shrink-0",
      "transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
      collapsed ? "w-[52px]" : "w-[200px]"
    )}>

      {/* Logo mark */}
      <div className={cn(
        "flex items-center h-[52px] border-b border-[#2d2b27] shrink-0 px-3.5",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_1px_4px_rgba(234,88,12,0.30)]">
          <Briefcase className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <span className="ml-2.5 font-semibold text-[#f0ede8] text-[13px] tracking-[-0.01em]">
            JobFlow
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2.5 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "relative flex items-center h-8 rounded-lg px-2.5 gap-2.5",
                "text-[13px] font-medium select-none",
                "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                active
                  ? "bg-[#ea580c]/10 text-orange-400"
                  : "text-[#6b6762] hover:bg-[#252320] hover:text-[#a8a49e]",
                collapsed && "justify-center px-0"
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-orange-500" />
              )}
              <Icon
                className={cn(
                  "w-[15px] h-[15px] shrink-0",
                  active ? "text-orange-400" : "text-[#6b6762]"
                )}
                strokeWidth={active ? 2 : 1.75}
              />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "flex items-center gap-2 h-10 border-t border-[#2d2b27] px-3.5",
          "text-[11px] font-medium text-[#6b6762] hover:text-[#a8a49e] hover:bg-[#252320]",
          "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <><ChevronLeft className="w-3.5 h-3.5" /><span>Collapse</span></>
        }
      </button>
    </aside>
  );
}

/* ── Mobile bottom tab bar ────────────────────────────────────────────── */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1c1b19]/90 backdrop-blur-md border-t border-[#2d2b27] flex z-40">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5",
              "text-[10px] font-medium transition-colors duration-150",
              active ? "text-orange-400" : "text-[#6b6762]"
            )}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
