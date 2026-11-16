import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

import { LegalLayout, LegalSection, linkInline } from "~/components/site";

const DESCRIPTION =
  "What LeadFlow AI collects on this website today (only waitlist email addresses), what it will collect at launch, how it is stored, and how to be removed.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — LeadFlow AI" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "LeadFlow AI" },
      { property: "og:title", content: "Privacy Policy — LeadFlow AI" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — LeadFlow AI" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "/og-image.png" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="November 7, 2026">
      <LegalSection heading="1. What this policy covers">
        <p>
          This policy covers this website. LeadFlow AI is a product that is still
          being built: it has not launched, there are no customer accounts and no
          live chatbots on anyone&rsquo;s site. What we can collect today is
          therefore very small, and this page describes it exactly rather than
          describing what the finished product will do.
        </p>
      </LegalSection>

      <LegalSection heading="2. What we collect today">
        <p>
          <strong className="font-semibold text-gray-900 dark:text-white">
            Only what you type into the waitlist form: your email address, and
            the date and time you submitted it.
          </strong>{" "}
          That is the entire record. We do not ask for your name, your company,
          your phone number or anything else on this site.
        </p>
        <p>
          If you never submit the waitlist form, this website collects nothing
          about you that is tied to you as a person.
        </p>
      </LegalSection>

      <LegalSection heading="3. What we do not do on this site">
        <ul className="list-disc space-y-2 pl-5">
          <li>No tracking cookies and no analytics or advertising pixels.</li>
          <li>No third-party marketing or profiling scripts.</li>
          <li>No newsletter — the waitlist is used for launch announcements only.</li>
          <li>We do not sell, rent or share your email address with anyone.</li>
        </ul>
        <p>
          The server that hosts this site keeps ordinary request logs so that it
          can serve pages. We do not analyse them for advertising or build
          profiles from them.
        </p>
      </LegalSection>

      <LegalSection heading="4. What we will collect once the product launches">
        <p>
          This is what we plan to collect at launch. We will update this policy
          before that happens, and it will be more specific than this summary.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-gray-900 dark:text-white">
              If you are a business using LeadFlow AI:
            </strong>{" "}
            account details — your email address, a password hash, your business
            name and the branding settings you choose.
          </li>
          <li>
            <strong className="font-semibold text-gray-900 dark:text-white">
              If you are a visitor talking to a business&rsquo;s chatbot:
            </strong>{" "}
            the conversation transcript, and whatever details you choose to
            share in it — which may include your name, email address, phone
            number, company, industry, budget range, timeline and project
            requirements.
          </li>
        </ul>
        <p>
          A visitor&rsquo;s conversation belongs to the business whose site the
          widget is on. That business can read it; other businesses cannot.
        </p>
      </LegalSection>

      <LegalSection heading="5. How it is stored">
        <p>
          Waitlist addresses are stored in a PostgreSQL database. Access is
          limited to the people building LeadFlow AI, and the site is served over
          HTTPS. We keep a waitlist address until we have emailed you about the
          launch, or until you ask us to remove it — whichever comes first.
        </p>
      </LegalSection>

      <LegalSection heading="6. How to be removed">
        <p>
          You can remove your address from the waitlist at any time, without an
          account and without explaining why, using the form below. Removal is
          immediate and permanent: the row is deleted, and there is nothing left
          to unsubscribe from.
        </p>
        <RemoveForm />
      </LegalSection>

      <LegalSection heading="7. Children">
        <p>
          This site and the planned product are intended for businesses, not for
          children. We do not knowingly collect information from anyone under 16.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to this policy">
        <p>
          If what we collect changes — most likely when the product launches —
          we will update this page and change the date at the top. Material
          changes will be described in the email we send the waitlist, not
          buried here.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          There is no support inbox yet, and we would rather say so than print an
          address that nobody reads. The removal form above is the one channel
          that works today. When the product launches, this policy will list a
          monitored contact address and every email we send will include a
          one-click removal link.
        </p>
      </LegalSection>

      <p className="border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
        See also our{" "}
        <a href="/terms" className={linkInline}>
          Terms of Service
        </a>
        .
      </p>
    </LegalLayout>
  );
}

type RemoveStatus = "idle" | "submitting" | "removed" | "not_found" | "invalid" | "unavailable" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const REMOVE_MESSAGES: Record<
  Exclude<RemoveStatus, "idle" | "submitting">,
  { tone: "ok" | "warn" | "error"; text: string }
> = {
  removed: {
    tone: "ok",
    text: "Your address has been removed from the waitlist.",
  },
  not_found: {
    tone: "ok",
    text: "That address isn't on the waitlist, so there is nothing to remove.",
  },
  invalid: {
    tone: "error",
    text: "That doesn't look like an email address — check it and try again.",
  },
  unavailable: {
    tone: "warn",
    text: "Waitlist removal isn't live yet — check back shortly.",
  },
  error: {
    tone: "error",
    text: "Something went wrong on our side, so nothing was removed. Please try again in a moment.",
  },
};

const TONE_CLASS: Record<"ok" | "warn" | "error", string> = {
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  error: "text-rose-700 dark:text-rose-400",
};

/** Lets a waitlisted person delete their own row. Same honesty rules as the form. */
function RemoveForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<RemoveStatus>("idle");

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
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
      } | null;

      if (response.ok && data?.ok) {
        setStatus(data.code === "not_found" ? "not_found" : "removed");
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
    status === "idle" || status === "submitting"
      ? null
      : REMOVE_MESSAGES[status];

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60"
    >
      <label
        htmlFor="remove-email"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        Remove an address from the waitlist
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="remove-email"
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
          aria-describedby="remove-status"
          aria-invalid={status === "invalid"}
          className="w-full flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus-visible:ring-offset-gray-900"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          {status === "submitting" ? "Removing…" : "Remove"}
        </button>
      </div>
      <p
        id="remove-status"
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-5 text-sm font-medium ${
          message ? TONE_CLASS[message.tone] : "text-transparent"
        }`}
      >
        {message ? message.text : "\u00a0"}
      </p>
    </form>
  );
}
