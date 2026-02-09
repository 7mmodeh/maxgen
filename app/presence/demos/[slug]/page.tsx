import { notFound } from "next/navigation";
import Link from "next/link";
import DemoGalleryClient from "./_components/DemoGalleryClient";
import { getPresenceDemo } from "@/src/lib/presence-demo/templates";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string };
};

export default function PresenceDemoPage(props: PageProps) {
  const tpl = getPresenceDemo(props.params.slug);
  if (!tpl) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/presence/demos"
          className="text-sm text-neutral-600 hover:underline"
        >
          ← Back to demos
        </Link>
      </div>

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-6 sm:p-10">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Live Demo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {tpl.hero.headline}
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            {tpl.hero.subheadline}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tpl.hero.badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {tpl.hero.ctas.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className={[
                  "rounded-xl px-5 py-3 text-sm font-semibold transition",
                  c.variant === "primary"
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                ].join(" ")}
              >
                {c.label}
              </a>
            ))}
          </div>

          {/* Docs buttons */}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/docs/maxgen-presence-sales-sheet.pdf"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              target="_blank"
              rel="noreferrer"
            >
              View Sales Sheet (PDF)
            </a>
            <a
              href="/docs/maxgen-presence-handbook.pdf"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              target="_blank"
              rel="noreferrer"
            >
              View Handbook (PDF)
            </a>
          </div>

          <div className="mt-6 text-xs text-neutral-500">
            Maxgen Systems — {tpl.nicheLabel} demo
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Services</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Clear service list so customers understand what you do before they
          contact you.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tpl.services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <p className="font-semibold text-neutral-900">{s.title}</p>
              <p className="mt-2 text-sm text-neutral-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Recent Work</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Visual proof builds trust fast — especially for local services.
        </p>
        <div className="mt-5">
          <DemoGalleryClient images={tpl.gallery} />
        </div>
      </section>

      {/* Trust + Areas */}
      <section className="mt-10 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight">
            Why customers choose us
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            {tpl.trustBullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span
                  className="mt-1 inline-block h-2 w-2 rounded-full bg-neutral-900"
                  aria-hidden="true"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight">
            Areas covered
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            Coverage clarity reduces hesitation and increases quote acceptance.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tpl.areasCovered.map((a) => (
              <span
                key={a}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mt-10">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Get a quote</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Simple contact block — WhatsApp and call are the fastest converters
            for local services.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={tpl.contact.whatsappHref}
              className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              WhatsApp: {tpl.contact.phoneDisplay}
            </a>
            <a
              href={tpl.contact.phoneHref}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Call: {tpl.contact.phoneDisplay}
            </a>
          </div>

          <div className="mt-6 text-xs text-neutral-500">
            {tpl.contact.note}
          </div>
        </div>
      </section>

      <footer className="mt-10 pb-10 text-center text-xs text-neutral-500">
        <p>Maxgen Systems — Online Presence Demo</p>
      </footer>
    </main>
  );
}
