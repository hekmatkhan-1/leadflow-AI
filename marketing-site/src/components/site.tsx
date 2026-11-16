import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Shared layout + chrome used by every page. */

export const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-950";

export const linkInline =
  "font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-800 hover:decoration-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-blue-300 dark:decoration-blue-700 dark:hover:text-blue-200 dark:focus-visible:ring-offset-gray-950";

/** The wordmark: gradient chat-bubble mark + "LeadFlow AI". */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-sm shadow-blue-500/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3c-4.97 0-9 3.58-9 8 0 2.3 1.1 4.36 2.86 5.78L5 21l4.2-2.05c.9.24 1.84.37 2.8.37 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-gray-900 sm:text-[17px] dark:text-white">
        LeadFlow <span className="text-blue-600 dark:text-blue-400">AI</span>
      </span>
    </span>
  );
}

/** Sticky top navigation. Anchor hrefs stay on-page for "/" and point back to it elsewhere. */
export function SiteNav({ onHomePage = false }: { onHomePage?: boolean }) {
  const anchor = (id: string) => (onHomePage ? `#${id}` : `/#${id}`);
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/85">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main"
        className={`${container} flex h-16 items-center justify-between gap-4`}
      >
        <Link
          to="/"
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
          aria-label="LeadFlow AI home"
        >
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href={anchor("how-it-works")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            How it works
          </a>
          <a
            href={anchor("pricing")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Pricing
          </a>
          <a
            href={anchor("faq")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            FAQ
          </a>
        </div>

        <a
          href={anchor("waitlist")}
          className={`${buttonPrimary} shrink-0 whitespace-nowrap px-3.5 py-2 text-xs sm:px-4 sm:text-sm`}
        >
          Join the waitlist
        </a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className={`${container} py-12`}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              An AI chatbot that qualifies the visitors your forms lose.
              Pre-launch — join the waitlist for early access.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-3 sm:items-end">
            <Link
              to="/privacy"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:text-gray-500">
          <p>© {year} LeadFlow AI. All rights reserved.</p>
          <p>
            Built with{" "}
            <a
              href="https://cto.new"
              className="underline underline-offset-2 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
            >
              cto.new
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Page shell for the legal pages: nav, prose column, footer. */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white dark:bg-gray-950">
      <SiteNav />
      <main id="main-content" className={`${container} max-w-3xl py-14 sm:py-20`}>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 15l-5-5 5-5" />
          </svg>
          Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {updated}
        </p>
        <div className="mt-10 space-y-9">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

/** A single numbered/labelled block inside the legal prose. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </section>
  );
}
