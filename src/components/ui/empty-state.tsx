import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Glowing gradient blob behind the icon */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-xl dark:from-blue-600/20 dark:to-cyan-600/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-500 shadow-sm dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-400">
          <Icon className="h-8 w-8 animate-[bounce_3s_ease-in-out_infinite]" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
