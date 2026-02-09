import Link from "next/link";
import PresenceDemoGallery from "../DemoGalleryClient";
import type { LayoutProps } from "./layout-types";

function sectionId(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function LayoutCleanClassic(props: LayoutProps) {
  const { tpl, vars } = props;

  const nav = [
    { label: "Services", id: "services" },
    { label: "Work", id: "work" },
    { label: "Reviews", id: "reviews" },
    { label: "Contact", id: "contact" },
  ] as const;

  const heroImage = tpl.gallery[0]?.src ?? null;

  return (
    <main className="min-h-screen bg-white" style={vars}>
      <header
        className="sticky top-0 z-30 border-b bg-white"
        style={{ borderColor: "var(--ring)" }}
      >
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

          <nav className="hidden items-center gap-4 md:flex">
            {nav.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="text-sm font-semibold hover:underline"
                style={{ color: "var(--muted)" }}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/presence/demos"
              className="hidden text-sm hover:underline sm:inline"
              style={{ color: "var(--muted)" }}
            >
              ← Demos
            </Link>
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

      <section className="border-b" style={{ borderColor: "var(--ring)" }}>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-12">
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

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div
                className="rounded-2xl border bg-white p-4"
                style={{ borderColor: "var(--ring)" }}
              >
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

              <div
                className="rounded-2xl border bg-white p-4"
                style={{ borderColor: "var(--ring)" }}
              >
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

              <div
                className="rounded-2xl border bg-white p-4"
                style={{ borderColor: "var(--ring)" }}
              >
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
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
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

          <aside className="lg:col-span-5">
            <div
              className="rounded-3xl border bg-white p-3 shadow-sm"
              style={{ borderColor: "var(--ring)" }}
            >
              <div
                className="aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  background: "var(--accentSoft)",
                }}
              >
                {heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage}
                    alt="Featured work"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    No image
                  </div>
                )}
              </div>

              <div className="px-2 pb-2 pt-4">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Quick contact
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Message photos + location for a fast quote.
                </p>

                <div className="mt-4 grid gap-2">
                  <a
                    href={tpl.contact.whatsappHref}
                    className="rounded-xl px-4 py-2 text-center text-sm font-semibold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={tpl.contact.phoneHref}
                    className="rounded-xl border bg-white px-4 py-2 text-center text-sm font-semibold"
                    style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                  >
                    Call
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
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
          </aside>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24">
        <section id={sectionId("Services")} className="scroll-mt-24 pt-10">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Services
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Clear service list with quick descriptions — easy to scan.
          </p>

          <div className="mt-6 grid gap-5">
            {tpl.services.map((s) => (
              <div
                key={s.title}
                className="grid gap-2 rounded-2xl border bg-white p-5 shadow-sm sm:grid-cols-[28px_1fr]"
                style={{ borderColor: "var(--ring)" }}
              >
                <div
                  className="h-7 w-7 rounded-lg"
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

        <section id={sectionId("Work")} className="scroll-mt-24 pt-12">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Recent Work
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Proof photos reduce hesitation and increase quote acceptance.
          </p>
          <div className="mt-5">
            <PresenceDemoGallery images={tpl.gallery} />
          </div>
        </section>

        <section id={sectionId("Reviews")} className="scroll-mt-24 pt-12">
          <div
            className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            style={{ borderColor: "var(--ring)" }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  className="text-xl font-semibold tracking-tight"
                  style={{ color: "var(--ink)" }}
                >
                  Reviews
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Clean “Google-style” proof — premium and readable.
                </p>
              </div>

              <p
                className="text-sm font-semibold"
                style={{ color: "var(--ink)" }}
              >
                ★ {tpl.quickFacts.ratingText}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                  ({tpl.quickFacts.reviewCountText})
                </span>
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
          </div>
        </section>

        <section id={sectionId("Contact")} className="scroll-mt-24 pt-12">
          <div
            className="rounded-3xl border p-6 shadow-sm sm:p-8"
            style={{
              borderColor: "var(--ring)",
              background:
                "linear-gradient(180deg, var(--accentSoft) 0%, rgba(255,255,255,1) 80%)",
            }}
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
          className="mt-12 pb-8 text-center text-xs"
          style={{ color: "var(--muted)" }}
        >
          {tpl.contact.note}
        </footer>
      </div>
    </main>
  );
}
