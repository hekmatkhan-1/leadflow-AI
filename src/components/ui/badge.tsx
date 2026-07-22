import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";
import type { LeadStatus } from "@/types";

// ---------------------------------------------------------------------------
// Badge variants
// ---------------------------------------------------------------------------

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "closed"
  | "hot"
  | "warm"
  | "cold";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  qualified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  hot: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  warm: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  cold: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

export function scoreLabel(score: number): string {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}

export function scoreToBadgeVariant(score: number): BadgeVariant {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

export function statusToBadgeVariant(status: LeadStatus): BadgeVariant {
  return status as BadgeVariant;
}
