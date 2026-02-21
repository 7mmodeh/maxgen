// app/supplies/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Maxgen Systems Ltd",
  description: "Privacy policy for Maxgen Systems Ltd and its product lines.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/supplies/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="mx-h1">Privacy Policy</h1>
      <p className="mx-lead mt-4 text-white/80">
        This page outlines how Maxgen Systems Ltd handles basic website and
        inquiry data.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-7 text-white/80">
        <section>
          <h2 className="mx-h2">1. Overview</h2>
          <p className="mt-3">
            We collect only the information necessary to respond to inquiries,
            support users, and operate our services. We aim to minimize data
            collection and retain data only as needed.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">2. What we may collect</h2>
          <ul className="mt-3 list-disc pl-5 text-white/80">
            <li>
              Contact details submitted by you (name, email, phone, business
              details)
            </li>
            <li>
              Message content you send to us (email/WhatsApp/contact forms)
            </li>
            <li>Basic technical logs (e.g., for security and reliability)</li>
          </ul>
        </section>

        <section>
          <h2 className="mx-h2">3. How we use information</h2>
          <ul className="mt-3 list-disc pl-5 text-white/80">
            <li>To respond to inquiries and provide support</li>
            <li>To verify B2B applicants where relevant (trade onboarding)</li>
            <li>
              To maintain operational security, prevent abuse, and troubleshoot
              issues
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mx-h2">4. Sharing</h2>
          <p className="mt-3">
            We do not sell personal data. We may share limited data with service
            providers only when necessary to operate the service (e.g., hosting,
            email) and subject to appropriate safeguards.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">5. Retention</h2>
          <p className="mt-3">
            We retain information only for as long as needed to respond, operate
            the service, and meet legal or compliance obligations.
          </p>
        </section>

        <section>
          <h2 className="mx-h2">6. Contact</h2>
          <p className="mt-3">
            If you have privacy questions, contact us at{" "}
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
