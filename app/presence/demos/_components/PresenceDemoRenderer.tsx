import type React from "react";
import Link from "next/link";
import PresenceDemoGallery from "../[slug]/_components/DemoGalleryClient";
import { getPresenceDemo } from "@/src/lib/presence-demo/templates";

type Props = {
  slug: string;
};

type CssVars = React.CSSProperties & {
  ["--accent"]?: string;
  ["--accentSoft"]?: string;
  ["--ink"]?: string;
  ["--muted"]?: string;
  ["--ring"]?: string;
};

export default function PresenceDemoRenderer(props: Props) {
  const tpl = getPresenceDemo(props.slug);

  if (!tpl) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Demo not found</h1>
        <p className="mt-2 text-neutral-600">This demo slug does not exist.</p>
        <Link
          className="mt-6 inline-block text-sm text-neutral-700 hover:underline"
          href="/presence/demos"
        >
          ← Back to demos
        </Link>
      </main>
    );
  }

  const vars: CssVars = {
    ["--accent"]: tpl.theme.accent,
    ["--accentSoft"]: tpl.theme.accentSoft,
    ["--ink"]: tpl.theme.ink,
    ["--muted"]: tpl.theme.muted,
    ["--ring"]: tpl.theme.ring,
  };

  return (
    <main className="min-h-screen" style={vars}>
      {/* Top bar (client site identity) */}
      <header className="border-b" style={{ borderColor: "var(--ring)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p
              className="truncate text-lg font-semibold"
              style={{ color: "var(--ink)" }}
            >
              {tpl.businessName}
            </p>
            <p className="truncate text-sm" style={{ color: "var(--muted)" }}>
              {tpl.nicheLabel}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={tpl.contact.phoneHref}
              className="hidden rounded-xl border px-3 py-2 text-sm font-semibold sm:inline-flex"
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

      {/* Body */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/presence/demos"
            className="text-sm hover:underline"
            style={{ color: "var(--muted)" }}
          >
            ← Back to demos
          </Link>
        </div>

        {/* Hero: conversion-first */}
        <section className="grid gap-6 lg:grid-cols-12">
          <div
            className="lg:col-span-7 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            style={{ borderColor: "var(--ring)" }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--accentSoft)", color: "var(--ink)" }}
            >
              Free Quotes • Fast Response
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
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: "var(--ring)", color: "var(--muted)" }}
                >
                  {b}
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

          {/* Trust card */}
          <aside
            className="lg:col-span-5 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            style={{ borderColor: "var(--ring)" }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--ink)" }}
            >
              Quick trust snapshot
            </p>

            <div className="mt-4 grid gap-3">
              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: "var(--ring)" }}
              >
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Rating
                </p>
                <p
                  className="mt-1 text-lg font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  ★ {tpl.quickFacts.ratingText}{" "}
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    ({tpl.quickFacts.reviewCountText})
                  </span>
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
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
              </div>

              <div
                className="rounded-2xl border p-4"
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
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: "var(--ring)" }}
              >
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Areas covered
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tpl.areasCovered.slice(0, 5).map((a) => (
                    <span
                      key={a}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        background: "var(--accentSoft)",
                        color: "var(--ink)",
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Recent work */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight"
                style={{ color: "var(--ink)" }}
              >
                Recent Work
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Real photos build trust before the customer even calls.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <PresenceDemoGallery images={tpl.gallery} />
          </div>
        </section>

        {/* Services */}
        <section className="mt-10">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Services
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            A clear list helps customers understand exactly what you offer.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tpl.services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border bg-white p-5 shadow-sm"
                style={{ borderColor: "var(--ring)" }}
              >
                <p
                  className="text-base font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {s.title}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why choose us */}
        <section className="mt-10">
          <div
            className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            style={{ borderColor: "var(--ring)" }}
          >
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Why customers choose {tpl.businessName}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Trust signals that reduce hesitation and increase quote
              acceptance.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tpl.trustBullets.map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-3 rounded-2xl border bg-white p-4"
                  style={{ borderColor: "var(--ring)" }}
                >
                  <span
                    className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--accent)" }}
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

        {/* Testimonials */}
        <section className="mt-10">
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Testimonials
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Social proof that matches what customers look for.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {tpl.testimonials.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                className="rounded-2xl border bg-white p-5 shadow-sm"
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

        {/* Quote form (demo-only, no backend) */}
        <section className="mt-10">
          <div
            className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
            style={{ borderColor: "var(--ring)" }}
          >
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              Request a Quote
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              This is a demo form layout — in a real client site, it can email
              you or route into WhatsApp.
            </p>

            <form className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Name
                </span>
                <input
                  className="rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--ring)" }}
                  placeholder="Your name"
                  name="name"
                />
              </label>

              <label className="grid gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Phone
                </span>
                <input
                  className="rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--ring)" }}
                  placeholder="Your phone number"
                  name="phone"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Message
                </span>
                <textarea
                  className="min-h-[120px] rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--ring)" }}
                  placeholder="Tell us what you need (photos help)."
                  name="message"
                />
              </label>

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <a
                  href={tpl.contact.whatsappHref}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  Send via WhatsApp
                </a>
                <a
                  href={tpl.contact.phoneHref}
                  className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold"
                  style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
                >
                  Call instead
                </a>
              </div>
            </form>
          </div>
        </section>

        {/* Footer disclosure only */}
        <footer
          className="mt-10 pb-24 text-center text-xs"
          style={{ color: "var(--muted)" }}
        >
          {tpl.contact.note}
        </footer>
      </div>

      {/* Sticky CTA (mobile-first conversion) */}
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
