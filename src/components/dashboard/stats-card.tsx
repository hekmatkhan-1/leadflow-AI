import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";
type AccentColor = "red" | "amber" | "blue" | "green" | "indigo" | "purple";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: TrendDirection;
  trendLabel?: string;
  accent?: AccentColor;
}

const accentStyles: Record<AccentColor, { dot: string; icon: string; bg: string }> = {
  red: {
    dot: "bg-red-500",
    icon: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
    bg: "border-l-red-500",
  },
  amber: {
    dot: "bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
    bg: "border-l-amber-500",
  },
  blue: {
    dot: "bg-blue-500",
    icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
    bg: "border-l-blue-500",
  },
  green: {
    dot: "bg-green-500",
    icon: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
    bg: "border-l-green-500",
  },
  indigo: {
    dot: "bg-indigo-500",
    icon: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30",
    bg: "border-l-indigo-500",
  },
  purple: {
    dot: "bg-purple-500",
    icon: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30",
    bg: "border-l-purple-500",
  },
};

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; className: string }> = {
  up: { icon: TrendingUp, className: "text-green-600 dark:text-green-400" },
  down: { icon: TrendingDown, className: "text-red-600 dark:text-red-400" },
  neutral: { icon: Minus, className: "text-gray-400 dark:text-gray-500" },
};

export function StatsCard({
  title,
  value,
  icon,
  trend = "neutral",
  trendLabel,
  accent = "blue",
}: StatsCardProps) {
  const styles = accentStyles[accent];
  const TrendIcon = trendConfig[trend].icon;

  return (
    <div
      className={cn(
        "group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900",
        "border-l-4",
        styles.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg",
            styles.icon
          )}
        >
          {icon}
        </div>
      </div>

      {trendLabel && (
        <div className="mt-4 flex items-center gap-1.5">
          <TrendIcon className={cn("h-4 w-4", trendConfig[trend].className)} />
          <span
            className={cn(
              "text-xs font-medium",
              trendConfig[trend].className
            )}
          >
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
