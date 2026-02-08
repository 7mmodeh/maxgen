// app/privacy/page.tsx

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Maxgen Systems",
  description:
    "Global Privacy Policy for maxgensys.com and Maxgen Systems products (Online Presence, QR Studio, and Supplies).",
};

function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@maxgensys.com";
}

export default function PrivacyPage() {
  const email = contactEmail();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs opacity-80">Maxgen Systems</p>
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-sm opacity-80 max-w-2xl">
          This is the global Privacy Policy for maxgensys.com and all Maxgen
          Systems product lines, including Online Presence, QR Studio, and
          Supplies (invite-only), unless a specific product page states
          additional or more specific terms.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/" className="underline underline-offset-4">
            Back to homepage
          </Link>
          <Link href="/terms" className="underline underline-offset-4">
            View Terms
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border p-5 text-sm opacity-85">
          <div>
            <span className="font-semibold">Data controller:</span> MAXGEN
            SYSTEMS LIMITED (Ireland)
          </div>
          <div className="mt-1">
            <span className="font-semibold">Contact:</span>{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </div>
          <div className="mt-1">
            <span className="font-semibold">Jurisdiction:</span> Ireland / EU
            (GDPR)
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6">
        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">What we collect</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • <span className="font-semibold">Account data:</span> basic
              identity and authentication data needed to provide access.
            </li>
            <li>
              • <span className="font-semibold">Product input data:</span>{" "}
              information you submit in forms (e.g., onboarding details for
              Online Presence, QR project content for QR Studio).
            </li>
            <li>
              • <span className="font-semibold">Operational data:</span> logs
              and records needed to prevent abuse, enforce limits fairly, and
              support customer requests.
            </li>
            <li>
              • <span className="font-semibold">Payment and billing data:</span>{" "}
              purchase status and billing metadata required to provide paid
              access. Card details are processed by the payment provider and are
              not stored directly by us.
            </li>
            <li>
              • <span className="font-semibold">Communications:</span> emails
              you send to our support address and our replies.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Why we use it (legal bases)</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • <span className="font-semibold">Contract:</span> to deliver the
              product or service you request and provide access to dashboards.
            </li>
            <li>
              • <span className="font-semibold">Legitimate interests:</span> to
              maintain security, prevent misuse, and operate the platform
              reliably.
            </li>
            <li>
              • <span className="font-semibold">Legal obligations:</span> for
              accounting, tax, and regulatory compliance where applicable.
            </li>
            <li>
              • <span className="font-semibold">Consent:</span> where required
              (for example, if you opt in to receive specific updates).
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Who we share data with</h2>
          <p className="mt-3 text-sm opacity-85">
            We do not sell personal data. We share data only with service
            providers necessary to operate the business (for example: hosting,
            authentication, file storage, payment processing), and only to the
            extent required to deliver the service.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Retention</h2>
          <p className="mt-3 text-sm opacity-85">
            We retain data for as long as needed to provide the service, meet
            legal obligations, resolve disputes, and enforce fair usage. Where a
            product uses usage limits, records may be retained to enforce those
            limits consistently.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Your rights (GDPR)</h2>
          <p className="mt-3 text-sm opacity-85">
            You may request access, rectification, deletion (where applicable),
            restriction, portability, and you may object to certain processing.
            To make a request, contact{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${email}`}
            >
              {email}
            </a>
            .
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="mt-3 text-sm opacity-85">
            We apply reasonable organizational and technical measures to protect
            data. No method of transmission or storage is guaranteed to be 100%
            secure.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Changes to this policy</h2>
          <p className="mt-3 text-sm opacity-85">
            We may update this Privacy Policy to reflect improvements or legal
            changes. The latest version will be published on this page.
          </p>
        </div>
      </section>

      <footer className="mt-10 text-xs opacity-70">
        Delivered by MAXGEN SYSTEMS LIMITED (Ireland). Governed by Irish / EU
        law.
      </footer>
    </main>
  );
}
