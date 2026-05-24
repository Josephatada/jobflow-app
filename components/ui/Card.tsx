import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-4",
        onClick && "cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}
