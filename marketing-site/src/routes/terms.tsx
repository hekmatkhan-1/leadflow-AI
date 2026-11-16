import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection, linkInline } from "~/components/site";

const DESCRIPTION =
  "The terms that apply to the LeadFlow AI website and waitlist today, and an honest description of the service planned for launch.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — LeadFlow AI" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "LeadFlow AI" },
      { property: "og:title", content: "Terms of Service — LeadFlow AI" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terms of Service — LeadFlow AI" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "/og-image.png" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="November 7, 2026">
      <LegalSection heading="1. Status of the service">
        <p>
          LeadFlow AI is <strong className="font-semibold text-gray-900 dark:text-white">pre-launch</strong>.
          There is no customer account system, no subscription, no payment
          processing and no live chatbot on any customer site. Nothing on this
          website is an offer to sell, and nothing here creates a contract for a
          service.
        </p>
        <p>
          These terms describe what applies today — visiting this website and
          joining the waitlist — and, separately, what we intend to apply once
          the service launches. We will replace these terms with launch terms
          before anyone can buy anything.
        </p>
      </LegalSection>

      <LegalSection heading="2. The waitlist">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Joining the waitlist is free and creates no obligation on either
            side. It is not a reservation, a contract or a guarantee of access.
          </li>
          <li>
            We plan to open early access in stages. Joining early does not
            guarantee you are admitted first.
          </li>
          <li>
            We will use your address to email you about the launch. You can
            remove it at any time from the{" "}
            <a href="/privacy" className={linkInline}>
              privacy policy
            </a>{" "}
            page.
          </li>
          <li>
            Please only submit an address you are entitled to use. Submitting
            someone else&rsquo;s address without their agreement is not allowed.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. The service we plan to launch">
        <p>
          LeadFlow AI is intended to be an embeddable chat widget for business
          websites. It holds a conversation with a visitor, asks qualifying
          questions about budget, timeline, company and industry, scores the
          resulting lead, and presents it in a dashboard the business can filter,
          sort and export.
        </p>
        <p>
          Everything described on this website is a plan for that launch. Details
          — including the features of each tier, the qualification questions and
          the look of the widget — may change before launch. We will not describe
          something as available that is not available.
        </p>
      </LegalSection>

      <LegalSection heading="4. Planned pricing">
        <p>
          The Free, Pro ($49/month) and Business ($149/month) tiers shown on the
          homepage are the pricing we intend to launch with. They are not for
          sale, cannot be purchased, and may change before launch. No one is
          charged anything today, and no one will be charged at launch without
          agreeing to a final price first.
        </p>
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>When the service launches, you will not be permitted to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>use the widget for anything unlawful, deceptive or harassing;</li>
          <li>
            use it to collect data you have no lawful basis to collect, or to
            send unsolicited bulk messages;
          </li>
          <li>
            attempt to reverse engineer, disrupt, overload or gain unauthorised
            access to the service;
          </li>
          <li>
            misrepresent the assistant as a human being where that would mislead
            a visitor.
          </li>
        </ul>
        <p>Until launch, the same rules apply to your use of this website.</p>
      </LegalSection>

      <LegalSection heading="6. No warranty">
        <p>
          This website is provided &ldquo;as is&rdquo;. Because the product has
          not launched, we make no promise that any described feature will ship,
          on any particular date, or at all. We also do not warrant that this
          website will be uninterrupted or error-free.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          To the extent permitted by law, LeadFlow AI is not liable for any
          indirect, incidental, special or consequential damages arising from
          your use of this website, including lost profits, lost data or business
          interruption. Nothing in these terms limits liability that cannot be
          limited by law.
        </p>
      </LegalSection>

      <LegalSection heading="8. Governing law">
        <p>
          These terms are governed by the laws of the State of Delaware, United
          States, without regard to its conflict-of-law rules. Disputes will be
          handled in the courts located in Delaware.
        </p>
      </LegalSection>

      <LegalSection heading="9. Changes to these terms">
        <p>
          We will update these terms when the service launches, and whenever
          something material changes. The date at the top of this page always
          reflects the current version. Continuing to use the website after a
          change means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <p>
          There is no support inbox yet, so we are not publishing an address that
          nobody would answer. If you need an address removed from the waitlist,
          the form in our{" "}
          <a href="/privacy" className={linkInline}>
            privacy policy
          </a>{" "}
          does that directly. A monitored contact address will be listed here
          when the product launches.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
