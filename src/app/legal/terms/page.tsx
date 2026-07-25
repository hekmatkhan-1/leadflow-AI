import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-900 dark:text-gray-100">
      <Link
        href="/"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400 mb-6 inline-block"
      >
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Last updated: July 20, 2026
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          By using LeadFlow AI, you agree to these Terms of Service. If you do
          not agree to these terms, do not use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Acceptable Use</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          You agree not to misuse the chatbot, including: spamming, attempting to
          reverse engineer the service, using the service for any illegal purpose,
          or interfering with the operation of the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Disclaimer of Warranties</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          The service is provided &quot;as is&quot; without warranties of any kind,
          express or implied. LeadFlow AI does not warrant that the service will
          be uninterrupted, error-free, or completely secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Limitation of Liability</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          LeadFlow AI shall not be liable for any indirect, incidental, special,
          or consequential damages arising from your use of the service, including
          but not limited to loss of data or business interruption.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Governing Law</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          These terms are governed by the laws of the State of Delaware, United
          States. Any disputes shall be resolved in the courts of Delaware.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Changes to Terms</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          We reserve the right to modify these terms at any time. Continued use
          of the service after changes are posted constitutes acceptance of the
          updated terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          For questions about these Terms of Service, contact us at{" "}
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
