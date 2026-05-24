import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-full select-none",
          "transition-all duration-150 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:pointer-events-none",
          variant === "primary"   && "bg-orange-600 text-white hover:bg-orange-700 shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_2px_8px_rgba(234,88,12,0.22)]",
          variant === "secondary" && "bg-[#252320] text-[#a8a49e] border border-[#2d2b27] hover:bg-[#2d2b27] hover:text-[#f0ede8] shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
          variant === "ghost"     && "text-[#6b6762] hover:bg-[#252320] hover:text-[#a8a49e]",
          variant === "danger"    && "bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-950/50",
          size === "sm" && "text-xs px-3.5 h-7 tracking-[0.01em]",
          size === "md" && "text-sm px-4 h-9",
          size === "lg" && "text-sm px-6 h-10",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
