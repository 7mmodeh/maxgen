import Link from "next/link";
import PresenceDemoGallery from "../DemoGalleryClient";
import type { LayoutProps } from "./layout-types";
import QuoteCard from "./QuoteCard";

function howItWorksSteps(): readonly { title: string; body: string }[] {
  return [
    { title: "Message us", body: "Send photos and location on WhatsApp." },
    {
      title: "Get a clear quote",
      body: "We confirm scope and price up front.",
    },
    {
      title: "Collection done",
      body: "We arrive on time and remove everything.",
    },
  ];
}

export default function LayoutSplitModern(props: LayoutProps) {
  const { tpl, vars, serviceOptions } = props;

  const steps = howItWorksSteps();

  return (
    <main className="min-h-screen" style={vars}>
      <div className="border-b bg-white" style={{ borderColor: "var(--ring)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p
              className="truncate text-base font-semibold"
              style={{ color: "var(--ink)" }}
            >
              {tpl.businessName}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
              {tpl.nicheLabel}
            </p>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/presence/demos"
              className="text-sm hover:underline"
              style={{ color: "var(--muted)" }}
            >
              ← Demos
            </Link>
            <Link
              href="/"
              className="text-sm hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Home
            </Link>
          </nav>

          <div className="flex shrink-0 gap-2">
            <a
              href={tpl.contact.phoneHref}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
            >
              Call
            </a>
            <a
              href={tpl.contact.whatsappHref}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, var(--accentSoft) 140%)",
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1
                className="text-3xl font-semibold tracking-tight sm:text-5xl"
                style={{ color: "var(--ink)" }}
              >
                {tpl.hero.headline}
              </h1>
              <p
                className="mt-4 text-base sm:text-lg"
                style={{ color: "var(--muted)" }}
              >
                {tpl.hero.subheadline}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {tpl.hero.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border bg-white px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                  >
                    {b}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {steps.map((s) => (
                  <div
                    key={s.title}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: "var(--ring)" }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--ink)" }}
                    >
                      {s.title}
                    </p>
                    <p
                      className="mt-2 text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={tpl.contact.whatsappHref}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  Book via WhatsApp
                </a>
                <a
                  href={tpl.contact.phoneHref}
                  className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold"
                  style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                >
                  Call for availability
                </a>
              </div>

              <div className="mt-6">
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Rating:{" "}
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                    {tpl.quickFacts.ratingText}
                  </span>{" "}
                  • {tpl.quickFacts.reviewCountText} •{" "}
                  {tpl.quickFacts.responseTimeText}
                </p>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <QuoteCard tpl={tpl} serviceOptions={serviceOptions} />
            </aside>
          </div>

          <div
            className="mt-10 rounded-3xl border bg-white p-5 shadow-sm"
            style={{ borderColor: "var(--ring)" }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--ink)" }}
            >
              Proof photos
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Visitors convert faster when they can see real loads and results.
            </p>
            <div className="mt-4">
              <PresenceDemoGallery images={tpl.gallery} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24">
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ color: "var(--ink)" }}
              >
                Services
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                A clean list for quick scanning — built for mobile visitors.
              </p>
            </div>
            <a
              href={tpl.contact.whatsappHref}
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
              style={{ background: "var(--accent)" }}
            >
              WhatsApp now
            </a>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {tpl.services.map((s) => (
              <div
                key={s.title}
                className="flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm"
                style={{ borderColor: "var(--ring)" }}
              >
                <div
                  className="mt-1 h-9 w-9 rounded-xl"
                  style={{ background: "var(--accentSoft)" }}
                  aria-hidden
                />
                <div>
                  <p
                    className="text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {s.title}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div
            className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            style={{ borderColor: "var(--ring)" }}
          >
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Areas covered
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Clear coverage reduces back-and-forth and increases conversions.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {tpl.areasCovered.map((a) => (
                <span
                  key={a}
                  className="rounded-full border bg-white px-3 py-1 text-xs"
                  style={{ borderColor: "var(--ring)", color: "var(--muted)" }}
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={tpl.contact.whatsappHref}
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                style={{ background: "var(--accent)" }}
              >
                Check availability
              </a>
              <a
                href={tpl.contact.phoneHref}
                className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
              >
                Call now
              </a>
            </div>
          </div>
        </section>

        <footer
          className="mt-12 pb-8 text-center text-xs"
          style={{ color: "var(--muted)" }}
        >
          {tpl.contact.note}
        </footer>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur"
        style={{ borderColor: "var(--ring)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--ink)" }}
            >
              Book a collection
            </p>
            <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
              {tpl.businessName}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href={tpl.contact.phoneHref}
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
            >
              Call
            </a>
            <a
              href={tpl.contact.whatsappHref}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
