"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Briefcase, LayoutGrid, ListChecks, LogOut, Settings } from "lucide-react";
import { signOutAction } from "@/app/actions";

const NAV_ITEMS = [
  { href: "/board",    label: "Board", icon: LayoutGrid },
  { href: "/summary",  label: "Summary", icon: ListChecks },
  { href: "/stats",    label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <>
    <header className="hidden sm:flex h-[52px] w-full bg-[#1c1b19] border-b border-[#2d2b27] items-center px-4 shrink-0">
      {/* Logo */}
      <Link href="/board" className="flex items-center gap-2.5 mr-8 select-none">
        <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center shrink-0 shadow-[0_1px_4px_rgba(234,88,12,0.30)]">
          <Briefcase className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </div>
        <span className="font-semibold text-[#f0ede8] text-[13px] tracking-[-0.01em]">
          JobFlow
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center h-8 px-3 rounded-md",
                "text-[13px] font-medium select-none",
                "transition-colors duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                active
                  ? "text-[#f0ede8] font-semibold"
                  : "text-[#6b6762] hover:text-[#a8a49e]"
              )}
            >
              {label}
              {/* Bottom border indicator */}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="ml-auto">
        <button
          type="submit"
          className="h-8 px-3 rounded-md flex items-center gap-2 text-[13px] font-medium text-[#6b6762] hover:text-[#a8a49e] hover:bg-[#252320]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </form>
    </header>
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] pb-[env(safe-area-inset-bottom)] bg-[#1c1b19]/95 backdrop-blur border-t border-[#2d2b27] grid grid-cols-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold",
              active ? "text-orange-400" : "text-[#6b6762]"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
    </>
  );
}
