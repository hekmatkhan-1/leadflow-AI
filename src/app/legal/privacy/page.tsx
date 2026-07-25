import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-900 dark:text-gray-100">
      <Link
        href="/"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400 mb-6 inline-block"
      >
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Last updated: July 20, 2026
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          We collect information you voluntarily provide through our chatbot,
          including: name, email address, phone number, company name, industry,
          budget range, timeline, and project requirements. All information is
          collected only when you choose to share it during a conversation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          Your information is used for lead qualification purposes and is stored
          in the CRM system of the business you are interacting with. We do not
          sell, rent, or share your personal information with third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          All data is stored in Supabase, a secure PostgreSQL database with Row
          Level Security (RLS) enabled. Data is encrypted at rest and in transit.
          Only the business you interact with can access your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Cookies and Local Storage</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          We use localStorage to store your visitor ID and cached widget settings
          for chat functionality. No tracking cookies are used.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          You may request deletion of your data at any time by contacting the
          business you interacted with, or by emailing us at{" "}
          <a
            href="mailto:support@leadflow.ai"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            support@leadflow.ai
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a
            href="mailto:support@leadflow.ai"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            support@leadflow.ai
          </a>
          .
        </p>
      </section>
    </div>
  );
}
