import Link from "next/link";
import PresenceDemoGallery from "../DemoGalleryClient";
import type { LayoutProps } from "./layout-types";
import QuoteCard from "./QuoteCard";

export default function LayoutLpPremium(props: LayoutProps) {
  const { tpl, vars, serviceOptions } = props;

  return (
    <main className="min-h-screen" style={vars}>
      <header
        className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur"
        style={{ borderColor: "var(--ring)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
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

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={tpl.contact.phoneHref}
              className="hidden rounded-xl border bg-white px-3 py-2 text-sm font-semibold sm:inline-flex"
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
      </header>

      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 400px at 20% 10%, var(--accentSoft) 0%, rgba(255,255,255,0) 60%), radial-gradient(900px 420px at 80% 20%, var(--accentSoft2) 0%, rgba(255,255,255,0) 60%)",
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/presence/demos"
                className="text-sm hover:underline"
                style={{ color: "var(--muted)" }}
              >
                ← Back to demos
              </Link>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                •
              </span>
              <Link
                href="/"
                className="text-sm hover:underline"
                style={{ color: "var(--muted)" }}
              >
                Home
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "var(--accentSoft)", color: "var(--ink)" }}
              >
                Free Quotes • Fast Response • Local Service
              </div>

              <h1
                className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: "var(--ink)" }}
              >
                {tpl.hero.headline}
              </h1>

              <p
                className="mt-3 text-base sm:text-lg"
                style={{ color: "var(--muted)" }}
              >
                {tpl.hero.subheadline}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {tpl.hero.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border bg-white px-3 py-1 text-xs"
                    style={{
                      borderColor: "var(--ring)",
                      color: "var(--muted)",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>

              <div
                className="mt-6 grid gap-3 rounded-3xl border bg-white p-5 shadow-sm sm:grid-cols-4"
                style={{
                  borderColor: "var(--ring)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Rating
                  </p>
                  <p
                    className="mt-1 text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    ★ {tpl.quickFacts.ratingText}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {tpl.quickFacts.reviewCountText}
                  </p>
                </div>

                <div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Response
                  </p>
                  <p
                    className="mt-1 text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {tpl.quickFacts.responseTimeText}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    WhatsApp / Call
                  </p>
                </div>

                <div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Assurance
                  </p>
                  <p
                    className="mt-1 text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {tpl.quickFacts.insuredText}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Clear scope first
                  </p>
                </div>

                <div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Coverage
                  </p>
                  <p
                    className="mt-1 text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {tpl.areasCovered.length}+ areas
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Listed below
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={tpl.contact.whatsappHref}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  WhatsApp for a Quote
                </a>
                <a
                  href={tpl.contact.phoneHref}
                  className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold"
                  style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                >
                  Call Now
                </a>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/docs/maxgen-presence-sales-sheet.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                >
                  View Sales Sheet (PDF)
                </a>
                <a
                  href="/docs/maxgen-presence-handbook.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                >
                  View Handbook (PDF)
                </a>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <QuoteCard tpl={tpl} serviceOptions={serviceOptions} />
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24">
        <section className="mt-8">
          <div className="flex flex-col gap-1">
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Services
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Clear, scannable services — built to convert visitors.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tpl.services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border bg-white p-6 shadow-sm"
                style={{ borderColor: "var(--ring)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {s.title}
                  </p>
                  <span
                    className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-1">
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Recent Work
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Proof matters — real photos reduce hesitation.
            </p>
          </div>

          <div className="mt-5">
            <PresenceDemoGallery images={tpl.gallery} />
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
              Why choose {tpl.businessName}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Trust signals that remove friction and help customers commit.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tpl.trustBullets.map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-3 rounded-2xl border bg-white p-4"
                  style={{ borderColor: "var(--ring)" }}
                >
                  <div
                    className="mt-1.5 h-8 w-8 rounded-xl"
                    style={{ background: "var(--accentSoft)" }}
                    aria-hidden="true"
                  />
                  <p className="text-sm" style={{ color: "var(--ink)" }}>
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-1">
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Testimonials
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Social proof presented cleanly — like premium lead-gen pages.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {tpl.testimonials.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                className="rounded-2xl border bg-white p-6 shadow-sm"
                style={{ borderColor: "var(--ring)" }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {"★".repeat(t.stars)}
                </p>
                <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
                  “{t.quote}”
                </p>
                <p
                  className="mt-4 text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {t.name}
                  {t.location ? (
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      {" "}
                      — {t.location}
                    </span>
                  ) : null}
                </p>
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
                WhatsApp for a Quote
              </a>
              <a
                href={tpl.contact.phoneHref}
                className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
              >
                Call Now
              </a>
            </div>
          </div>
        </section>

        <footer
          className="mt-10 pb-8 text-center text-xs"
          style={{ color: "var(--muted)" }}
        >
          {tpl.contact.note}
        </footer>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur"
        style={{ borderColor: "var(--ring)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--ink)" }}
            >
              Get a quick quote
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
