import Link from "next/link";

export const metadata = {
  title: "Onboarding & Delivery | Maxgen Presence",
  description:
    "How Maxgen Presence works: purchase, onboarding, build, and delivery. Productized and fast.",
};

export default function PresenceDocsProcessPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header>
        <p className="text-xs opacity-70">Maxgen Presence</p>
        <h1 className="mt-2 text-3xl font-semibold">Onboarding & Delivery</h1>
        <p className="mt-3 text-sm opacity-80 max-w-2xl">
          Simple, structured execution. No long calls required.
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

      <section className="mt-10 grid gap-4">
        {[
          {
            t: "Step 1 — Purchase",
            d: "Place your order securely through our website.",
          },
          {
            t: "Step 2 — Onboarding",
            d: "Complete a short onboarding form covering business name, services, contact details, preferred domain, and booking rules (if applicable).",
          },
          {
            t: "Step 3 — Build & Setup",
            d: "We build the agreed product, configure contact and booking systems, connect domain or subdomain, and prepare for launch.",
          },
          {
            t: "Step 4 — Delivery",
            d: "You receive confirmation once live. Typical delivery is 24–48 hours after onboarding.",
          },
          {
            t: "Support",
            d: "Questions can be sent to the official contact email on the site.",
          },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border p-6">
            <div className="text-lg font-semibold">{x.t}</div>
            <div className="mt-2 text-sm opacity-80">{x.d}</div>
          </div>
        ))}
      </section>

      <footer className="mt-10 text-xs opacity-70">
        Delivered by MAXGEN SYSTEMS LIMITED (Ireland). Governed by Irish law.
      </footer>
    </main>
  );
}
