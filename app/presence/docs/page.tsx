import Link from "next/link";

export const metadata = {
  title: "Online Presence Products | Maxgen Systems",
  description:
    "Productized online presence solutions for local businesses. Fixed scope, fast delivery, owned by you.",
};

function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@maxgensys.com";
}

export default function PresenceDocsOverviewPage() {
  const email = contactEmail();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs opacity-80">
          Delivered by{" "}
          <span className="font-semibold">MAXGEN SYSTEMS LIMITED</span>{" "}
          (Ireland)
        </p>
        <h1 className="text-3xl font-semibold">Online Presence Products</h1>
        <p className="text-sm opacity-80 max-w-2xl">
          Productized services with fixed scope and fast delivery. No retainers.
          No vague promises.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/online-presence"
            className="rounded-lg px-5 py-3 text-sm font-semibold"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            View packages & order
          </Link>

          <a
            href={`mailto:${encodeURIComponent(email)}?subject=Online%20Presence%20Question`}
            className="rounded-lg border px-5 py-3 text-sm font-semibold"
          >
            Ask a question
          </a>

          <Link
            href="/presence/docs/downloads"
            className="rounded-lg border px-5 py-3 text-sm font-semibold"
          >
            Download PDFs
          </Link>
        </div>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <div className="text-xs opacity-70">Product A</div>
          <h2 className="mt-2 text-xl font-semibold">Presence Basic — €400</h2>
          <p className="mt-2 text-sm opacity-80">
            Professional one-page online presence designed to make your business
            visible, contactable, and credible online.
          </p>

          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>• One-page professional website (mobile + desktop)</li>
            <li>• Domain connection (or managed subdomain)</li>
            <li>• Contact form + click-to-call</li>
            <li>• Google Business Profile setup</li>
            <li>• Basic indexing setup</li>
          </ul>

          <p className="mt-4 text-sm">
            <span className="font-semibold">Delivery:</span> typically live
            within 24–48 hours after onboarding.
          </p>

          <p className="mt-3 text-sm opacity-80">
            Optional maintenance:{" "}
            <span className="font-semibold">€25/month</span>
          </p>

          <div className="mt-5 flex gap-4 text-sm">
            <Link
              href="/online-presence#packages"
              className="underline underline-offset-4"
            >
              Order Basic
            </Link>
            <Link
              href="/presence/docs/scope"
              className="underline underline-offset-4"
            >
              Scope boundaries
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <div className="text-xs opacity-70">Product B</div>
          <h2 className="mt-2 text-xl font-semibold">
            Presence Booking — €900
          </h2>
          <p className="mt-2 text-sm opacity-80">
            Everything in Basic, plus an online booking system to reduce
            back-and-forth and automate scheduling.
          </p>

          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li>• Everything in Presence Basic</li>
            <li>• Online booking system</li>
            <li>• Calendar sync</li>
            <li>• Automated confirmations</li>
            <li>• Cancellation rules</li>
            <li>• Notifications (email / WhatsApp / SMS)</li>
          </ul>

          <p className="mt-4 text-sm">
            <span className="font-semibold">Delivery:</span> typically live
            within 24–48 hours after onboarding.
          </p>

          <p className="mt-3 text-sm opacity-80">
            Optional maintenance:{" "}
            <span className="font-semibold">€50/month</span>
          </p>

          <div className="mt-5 flex gap-4 text-sm">
            <Link
              href="/online-presence#packages"
              className="underline underline-offset-4"
            >
              Order Booking
            </Link>
            <Link
              href="/presence/docs/process"
              className="underline underline-offset-4"
            >
              Delivery process
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border p-6">
        <h3 className="text-lg font-semibold">Key Principles</h3>
        <ul className="mt-3 space-y-2 text-sm opacity-85">
          <li>• Fixed scope and defined deliverables</li>
          <li>• No long-term contracts or retainers</li>
          <li>• You own what’s built (no lock-in)</li>
          <li>• Governed by Irish law</li>
        </ul>

        <p className="mt-4 text-xs opacity-70">
          VAT note: MAXGEN SYSTEMS LIMITED is not VAT registered at the time of
          writing (registration in progress).
        </p>
      </section>
    </main>
  );
}
