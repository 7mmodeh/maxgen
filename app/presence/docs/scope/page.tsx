import Link from "next/link";

export const metadata = {
  title: "Scope & Boundaries | Maxgen Presence",
  description:
    "Clear scope boundaries for Maxgen Presence products. Fixed deliverables, exclusions, and disclaimers.",
};

export default function PresenceDocsScopePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header>
        <p className="text-xs opacity-70">Maxgen Presence</p>
        <h1 className="mt-2 text-3xl font-semibold">Scope & Boundaries</h1>
        <p className="mt-3 text-sm opacity-80 max-w-2xl">
          We deliver quickly and consistently by keeping scope clear. This
          protects both parties.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/presence/docs"
            className="rounded-lg border px-5 py-3 text-sm font-semibold"
          >
            Back to overview
          </Link>
          <Link
            href="/online-presence"
            className="rounded-lg px-5 py-3 text-sm font-semibold"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            View packages & order
          </Link>
        </div>
      </header>

      <section className="mt-10 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Included by default</h2>
        <ul className="mt-3 space-y-2 text-sm opacity-85">
          <li>• Defined deliverables per product</li>
          <li>
            • Clean professional setup aligned with local service businesses
          </li>
          <li>• One onboarding submission (single source of truth)</li>
          <li>• Delivery within the stated timeframe after onboarding</li>
          <li>• Ownership of delivered assets (no lock-in)</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Not included by default</h2>
        <ul className="mt-3 space-y-2 text-sm opacity-85">
          <li>• Custom website designs (beyond the product format)</li>
          <li>• Unlimited revisions</li>
          <li>• Advertising or paid traffic management</li>
          <li>• Guaranteed rankings, leads, or revenue</li>
          <li>• Social media management</li>
          <li>• Content writing beyond agreed scope</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">SEO & performance disclaimer</h2>
        <p className="mt-3 text-sm opacity-80">
          Search visibility depends on competition, location, reviews, and
          external factors. MAXGEN SYSTEMS LIMITED provides technical execution
          and setup only, not performance guarantees.
        </p>
      </section>

      <footer className="mt-10 text-xs opacity-70">
        Delivered by MAXGEN SYSTEMS LIMITED (Ireland). Governed by Irish law.
      </footer>
    </main>
  );
}
