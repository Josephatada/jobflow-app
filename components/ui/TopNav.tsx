"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { href: "/board",    label: "Board" },
  { href: "/summary",  label: "Summary" },
  { href: "/stats",    label: "Stats" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="h-[52px] w-full bg-[#1c1b19] border-b border-[#2d2b27] flex items-center px-4 shrink-0">
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
    </header>
  );
}
