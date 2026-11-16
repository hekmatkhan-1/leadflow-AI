import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  SiteFooter,
  SiteNav,
  buttonPrimary,
  buttonSecondary,
  container,
  linkInline,
} from "~/components/site";

const SITE_DESCRIPTION =
  "LeadFlow AI is an AI chatbot that engages website visitors 24/7, qualifies them in conversation, scores every lead and puts the results in a clean CRM dashboard — from a single embed script.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadFlow AI — Turn website visitors into qualified leads" },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "LeadFlow AI" },
      {
        property: "og:title",
        content: "LeadFlow AI — Turn website visitors into qualified leads",
      },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:image:alt", content: "LeadFlow AI — turn website visitors into qualified leads" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "LeadFlow AI — Turn website visitors into qualified leads",
      },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: "/og-image.png" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-dvh bg-white dark:bg-gray-950">
      <SiteNav onHomePage />
      <main id="main-content">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Pricing />
        <Faq />
        <Waitlist />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ hero */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200/70 dark:border-gray-800/70">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-blue-950/30 dark:via-gray-950 dark:to-gray-950"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/10"
      />
      <div className={`${container} relative py-14 sm:py-20 lg:py-24`}>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
              <span
                className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                aria-hidden="true"
              />
              Pre-launch · waitlist open
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Turn website visitors into{" "}
              <span className="bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                qualified leads
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              LeadFlow AI is an AI chatbot that engages your visitors 24/7,
              qualifies them through natural conversation, scores every lead and
              funnels everything into a clean CRM dashboard — all from a single
              embed script.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#waitlist" className={buttonPrimary}>
                Join the waitlist
              </a>
              <a href="#pricing" className={buttonSecondary}>
                See pricing
              </a>
            </div>

            <p className="mt-5 text-sm text-gray-600 dark:text-gray-400">
              No account, no card. We&rsquo;ll email you once when early access
              opens.
            </p>
          </div>

          <ChatPreview />
        </div>
      </div>
    </section>
  );
}

/** Decorative product illustration built from plain markup (no screenshots). */
function ChatPreview() {
  return (
    <div className="relative">
      <div
        role="img"
        aria-label="Illustration: the LeadFlow AI chat widget asks a visitor what they need, records their budget and timeline, and produces a hot lead scored 92 with the details captured."
        className="relative rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-950/10 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3c-4.97 0-9 3.58-9 8 0 2.3 1.1 4.36 2.86 5.78L5 21l4.2-2.05c.9.24 1.84.37 2.8.37 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            LeadFlow AI
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Online
          </span>
        </div>

        <div className="space-y-2.5 bg-gray-50 px-4 py-4 dark:bg-gray-950/60">
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100">
            Hi 👋 Are you after a website rebuild, or ongoing work?
          </p>
          <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
            A rebuild. We&rsquo;re an agency, budget around $15k, live by March.
          </p>
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100">
            Perfect. What&rsquo;s the best email for a proposal?
          </p>
        </div>

        <div className="rounded-b-2xl border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-base font-bold text-white">
              92
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Hot lead
              </p>
              <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                Agency · $15k budget · 3-month timeline
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Budget set", "Timeline set", "Industry matched", "Email captured"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-500">
        Illustration of the embed widget and a scored lead.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- problem */

function Problem() {
  const formPain = [
    "Six or eight fields before a visitor learns whether you\u2019re even a fit.",
    "Most people leave the moment a form asks for budget.",
    "No way to ask \u201cdo you integrate with our stack?\u201d",
    "What arrives is a name and an email — no context, no priority.",
  ];
  const chatGain = [
    "The assistant asks in plain language, one question at a time.",
    "It answers objections in the moment instead of losing the visitor.",
    "It captures budget, timeline, company, industry and contact details as they talk.",
    "Every lead arrives scored, so you call the hottest ones first.",
  ];

  return (
    <section id="problem" className="scroll-mt-20 py-16 sm:py-24">
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            The problem
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            A form is a transaction. A conversation is a qualification.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            The visitors worth the most are usually the ones with the most
            questions. A form gives them nowhere to ask them.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              What a form does
            </h3>
            <ul className="mt-5 space-y-3.5">
              {formPain.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-0.5 h-5 w-5 shrink-0 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l8 8M14 6l-8 8" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 sm:p-8 dark:border-blue-900 dark:bg-blue-950/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              What a conversation does
            </h3>
            <ul className="mt-5 space-y-3.5">
              {chatGain.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- how it works */

const steps = [
  {
    title: "Install one snippet",
    body: "Paste a single script tag into your site — any site, no plugin or framework needed. The chat widget appears in the corner of every page it\u2019s on.",
  },
  {
    title: "The AI qualifies in conversation",
    body: "Visitors get a real conversation instead of a form. The assistant asks about budget, timeline, company and industry, and answers their questions as it goes.",
  },
  {
    title: "Hot leads land in your CRM",
    body: "Each conversation becomes a lead with a score and a full profile. Filter, sort, and export the ones worth calling today.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-gray-200 bg-gray-50 py-16 sm:py-24 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Three steps from embed script to booked call
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            This is the flow we&rsquo;re building. It isn&rsquo;t live on anyone&rsquo;s
            site yet — the waitlist gets the first invite when it is.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- features */

const features = [
  {
    title: "Always-on chat",
    body: "Your visitors get an answer at 2am on a Sunday, without anyone staffing a chat window. The widget is live on every page you install it on.",
    icon: "chat" as const,
  },
  {
    title: "Lead scoring you can explain",
    body: "Scores are rule-based, not a black box: budget, timeline, company, industry and contact details each contribute a set amount. A high score means specific answers, not a vibe.",
    icon: "score" as const,
  },
  {
    title: "A CRM that stays clean",
    body: "Every lead arrives with its full profile and conversation. Filter by score, sort by recency, open a lead to read what was said, export the list to CSV.",
    icon: "crm" as const,
  },
  {
    title: "One embed script",
    body: "A single script tag, no dependencies and no plugin. Custom branding on Pro, white-label on Business, so the widget looks like your site.",
    icon: "code" as const,
  },
];

const icons: Record<string, React.ReactNode> = {
  chat: (
    <path d="M4 5.5h16v10H9l-5 4v-14Z" />
  ),
  score: (
    <>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </>
  ),
  crm: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  code: (
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </>
  ),
};

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-24">
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Built for teams that can&rsquo;t staff live chat
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 sm:p-7 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {icons[feature.icon]}
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- pricing */

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    blurb: "Enough to put the widget on a small site and see what it captures.",
    features: [
      "Up to 50 leads per month",
      "Basic chatbot",
      "Standard lead scoring",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "/month",
    blurb: "For a team that wants the widget to look like theirs and the CRM to do the work.",
    features: [
      "Up to 500 leads per month",
      "Custom branding",
      "Full CRM dashboard",
      "CSV export",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "$149",
    cadence: "/month",
    blurb: "For high-traffic sites that need their own qualification questions.",
    features: [
      "Unlimited leads",
      "Custom qualification questions",
      "Priority AI",
      "White-label embed",
    ],
    featured: false,
  },
];

function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-y border-gray-200 bg-gray-50 py-16 sm:py-24 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Planned pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Three tiers, planned for launch
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            These are the prices we plan to launch with. Nothing is on sale
            today — there is no signup and no checkout, and we can&rsquo;t take a
            payment. Join the waitlist and we&rsquo;ll email you when it opens,
            with the final pricing confirmed first.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.featured
                  ? "relative flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-lg shadow-blue-600/10 sm:p-7 dark:border-blue-500 dark:bg-gray-900"
                  : "relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7 dark:border-gray-800 dark:bg-gray-900"
              }
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              ) : null}

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {plan.cadence}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {plan.blurb}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2.5 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-1 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 10.5l4 4 8-9" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`mt-7 ${
                  plan.featured ? buttonPrimary : buttonSecondary
                } w-full`}
              >
                Join the waitlist
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <strong className="font-semibold">Planned, not purchasable.</strong>{" "}
          LeadFlow AI is pre-launch. The tiers above are the pricing we intend to
          launch with; they may change before launch, and we&rsquo;ll confirm
          them with the waitlist before anyone is charged.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- FAQ */

const faqs = [
  {
    q: "What will it cost at launch?",
    a: "The tiers above are the pricing we plan to launch with: Free for up to 50 leads a month, Pro at $49/month, Business at $149/month. Nothing can be bought today. If the pricing changes before launch, the waitlist hears about it first — and no one is charged anything without agreeing to a final price.",
  },
  {
    q: "When does it launch?",
    a: "We don't have a launch date we're willing to publish yet. We'll email the waitlist the moment it opens — that's the only announcement we'll send.",
  },
  {
    q: "How long does install take?",
    a: "One script tag, pasted before the closing body tag of your site. If you can edit your site's theme or header settings, you can install it; it takes a few minutes, and the widget shows up on every page you add it to.",
  },
  {
    q: "What happens to visitor data?",
    a: "At launch, a conversation creates a lead in the workspace of the business whose site the widget is on — that business can read the conversation and the details the visitor chose to share. Nothing is sold or shared with other businesses. Today, before launch, this site collects only the email address you type into the waitlist form. Our privacy policy spells out both cases.",
  },
  {
    q: "Does it work with my existing site?",
    a: "Yes, if your site lets you add a script — WordPress, Webflow, Shopify, Squarespace, a custom build, all fine. It doesn't replace your site or your CMS; it sits on top of it as a chat widget.",
  },
  {
    q: "Do I need to write the questions the bot asks?",
    a: "No. It ships with a qualification flow covering budget, timeline, company, industry and contact details. Writing your own questions is a Business tier feature for teams that want a different flow.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Straight answers
          </h2>
        </div>

        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {faq.q}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- waitlist */

type FormStatus =
  | "idle"
  | "submitting"
  | "success"
  | "duplicate"
  | "invalid"
  | "unavailable"
  | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const STATUS_MESSAGES: Record<
  Exclude<FormStatus, "idle" | "submitting">,
  { tone: "ok" | "warn" | "error"; text: string }
> = {
  success: {
    tone: "ok",
    text: "You're on the list. We'll email you once when early access opens.",
  },
  duplicate: {
    tone: "ok",
    text: "You're already on the list.",
  },
  invalid: {
    tone: "error",
    text: "That doesn't look like an email address — check it and try again.",
  },
  unavailable: {
    tone: "warn",
    text: "Early access signup isn't live yet — check back shortly.",
  },
  error: {
    tone: "error",
    text: "Something went wrong on our side, so your email was not saved. Please try again in a moment.",
  },
};

const TONE_CLASS: Record<"ok" | "warn" | "error", string> = {
  ok: "text-emerald-300",
  warn: "text-amber-300",
  error: "text-rose-300",
};

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value) || value.length > 254) {
      setStatus("invalid");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
      } | null;

      // Only a 2xx from the API counts as saved — anything else is reported as
      // it is, never as a success.
      if (response.ok && data?.ok) {
        setStatus(data.code === "duplicate" ? "duplicate" : "success");
        setEmail("");
        return;
      }
      if (response.status === 503) {
        setStatus("unavailable");
        return;
      }
      if (response.status === 400) {
        setStatus("invalid");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const message =
    status === "idle" || status === "submitting" ? null : STATUS_MESSAGES[status];

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8">
      <label
        htmlFor="waitlist-email"
        className="block text-sm font-medium text-gray-200"
      >
        Email address
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle" && status !== "submitting") setStatus("idle");
          }}
          aria-describedby="waitlist-note waitlist-status"
          aria-invalid={status === "invalid"}
          className="w-full flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-[15px] text-white placeholder:text-gray-500 focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? "Joining…" : "Join the waitlist"}
        </button>
      </div>

      <p id="waitlist-note" className="mt-3 text-sm text-gray-400">
        One email when early access opens. Nothing else, and no sharing your
        address with anyone. See the{" "}
        <a href="/privacy" className={linkInline}>
          privacy policy
        </a>
        .
      </p>

      <p
        id="waitlist-status"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-6 text-sm font-medium ${
          message ? TONE_CLASS[message.tone] : "text-transparent"
        }`}
      >
        {message ? message.text : "\u00a0"}
      </p>
    </form>
  );
}

function Waitlist() {
  return (
    <section id="waitlist" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gray-950 px-6 py-12 ring-1 ring-gray-800 sm:px-12 sm:py-16">
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Waitlist
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Be first in when early access opens
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-300">
            We&rsquo;re building LeadFlow AI now. Leave your email and we&rsquo;ll
            send one message when early access opens — no newsletter, no drip
            sequence.
          </p>

          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
