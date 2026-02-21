// app/supplies/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Maxgen Systems Ltd",
  description: "Terms of service for Maxgen Systems Ltd and its product lines.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/supplies/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="mx-h1">Terms of Service</h1>
      <p className="mx-lead mt-4 text-white/80">
        These terms apply to Maxgen Systems Ltd websites and related product
        lines.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-white/80">
        <section>
          <h2 className="mx-h2">1. Use of the website</h2>
          <p className="mt-3">
            You agree to use the website lawfully and not to attempt to disrupt,
            exploit, or misuse any part of the service.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">2. B2B-only areas</h2>
          <p className="mt-3">
            Certain areas (e.g., wholesale onboarding) are intended for
            businesses only. We may request verification details and may approve
            or refuse access at our discretion.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">3. Information accuracy</h2>
          <p className="mt-3">
            Content is provided for operational and informational purposes. We
            may update content, product scope, or documentation without notice.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">4. Limitation of liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by law, Maxgen Systems Ltd is not
            liable for indirect or consequential losses arising from use of the
            website or reliance on its content.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">5. Contact</h2>
          <p className="mt-3">
            For questions about these terms, contact{" "}
            <a
              className="font-semibold text-white underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
              href="mailto:info@maxgensys.com"
            >
              info@maxgensys.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-10">
        <Link
          href="/supplies"
          className="text-sm font-semibold text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
        >
          Back to Supplies
        </Link>
      </div>
    </main>
  );
}
