import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "orange" | "green" | "red" | "gray" | "blue";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-gray-100 text-gray-600": variant === "default",
          "bg-orange-100 text-orange-700": variant === "orange",
          "bg-green-100 text-green-700": variant === "green",
          "bg-red-100 text-red-700": variant === "red",
          "bg-blue-100 text-blue-700": variant === "blue",
          "bg-gray-100 text-gray-500": variant === "gray",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
