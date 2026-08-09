"use client";

import { useRouter } from "next/navigation";
import { LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  userEmail: string;
  userName: string;
}

function getGreeting(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function DashboardHeader({ userEmail, userName }: DashboardHeaderProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  // Live clock — updates every second, client-side only to avoid hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [isDark]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

  const greeting = now ? getGreeting(now.getHours()) : "Welcome";
  const timeString = now
    ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";
  const dateString = now
    ? now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      {/* Left: greeting, name, live clock/date */}
      <div className="flex flex-col justify-center">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {greeting}, {userName} 👋
        </span>
        <span className="hidden text-xs text-gray-400 dark:text-gray-500 sm:block">
          {dateString} · {timeString}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
          {userEmail}
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
