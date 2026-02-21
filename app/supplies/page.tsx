// app/supplies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, Stagger, Item } from "../_components/motion";

export const metadata: Metadata = {
  title: "Maxgen Supplies — Wholesale Division (B2B) | Maxgen Systems Ltd",
  description:
    "Maxgen Supplies is the B2B wholesale division of Maxgen Systems Ltd (Ireland), aligned with NACE 4652. Trade-only access, controlled SKUs, specification-locked procurement, and invoice-first ordering. VAT registration in process as part of trade commencement preparations.",
  alternates: { canonical: "/supplies" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Maxgen Supplies — Wholesale Division (B2B)",
    description:
      "B2B wholesale division aligned with NACE 4652. Trade-only access, controlled SKUs, and invoice-first ordering. VAT registration in process as part of trade commencement preparations.",
    url: "/supplies",
    type: "website",
  },
};

function Divider() {
  return <div className="mx-auto my-10 h-px w-full max-w-6xl bg-white/10" />;
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
      {label}
    </span>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <span
            aria-hidden="true"
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--mx-light-accent)] shadow-[0_0_0_4px_rgba(56,189,248,0.10)]"
          />
          <span className="text-sm leading-6 text-white/85">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SuppliesDivisionOverviewPage() {
  const waHref =
    "https://wa.me/353833226565?text=Hi%20Maxgen%20Supplies%2C%20I%20want%20to%20enquire%20about%20B2B%20wholesale%20access%20and%20trade%20onboarding.";

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[color:var(--mx-accent-blue)]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-[color:var(--mx-light-accent)]/16 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* Hero */}
      <header className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8">
        <FadeIn>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--mx-light-accent)]" />
            Wholesale Division — Operated by Maxgen Systems Ltd (Ireland)
          </div>

          <h1 className="mx-h1 mt-5 max-w-4xl">
            Maxgen Supplies
            <span className="block text-white/70">
              B2B wholesale of mobile accessories
            </span>
          </h1>

          <p className="mx-lead mt-4 max-w-3xl text-white/80">
            A structured B2B wholesale division providing verified trade account
            access, controlled catalogue visibility, specification-locked
            procurement, and invoice-first ordering aligned with{" "}
            <span className="font-semibold text-white">NACE 4652</span>.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Chip label="B2B only (no consumer sales)" />
            <Chip label="Controlled, locked SKUs" />
            <Chip label="Specification-locked procurement" />
            <Chip label="Invoice-first workflow" />
            <Chip label="NACE 4652 aligned" />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/supplies/b2b"
              className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Open B2B portal
            </Link>

            <Link
              href="/supplies/apply"
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Apply for a trade account
            </Link>

            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              WhatsApp Business
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[color:var(--mx-accent-blue)]/10 p-5">
            <div className="text-sm font-semibold text-white">
              Status note (VAT readiness)
            </div>
            <p className="mt-2 text-sm leading-6 text-white/80">
              This division and portal are established as part of trading
              commencement preparations. VAT registration is in process and VAT
              will be applied as required once active trading commences.
            </p>
          </div>
        </FadeIn>

        <Stagger>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                k: "Primary classification",
                v: "NACE 4652",
                d: "Wholesale of electronic and telecommunications equipment and parts.",
              },
              {
                k: "Access model",
                v: "Verified trade accounts",
                d: "Approval required to view trade pricing and place wholesale orders.",
              },
              {
                k: "Documentation",
                v: "Invoice-first workflow",
                d: "Order confirmation and records supported via invoice and dispatch documentation.",
              },
            ].map((x) => (
              <Item key={x.k}>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-xs font-semibold text-white/65">
                    {x.k}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {x.v}
                  </div>
                  <div className="mt-2 text-sm text-white/75">{x.d}</div>
                </div>
              </Item>
            ))}
          </div>
        </Stagger>
      </header>

      <Divider />

      {/* Operating model */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-3xl">
                <h2 className="mx-h2">Operating model</h2>
                <p className="mx-lead mt-3 text-white/80">
                  Built for controlled wholesale operations: supplier
                  onboarding, locked SKUs, verified accounts, and documented
                  ordering.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">
                  Supplier onboarding
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Trading preparations include active supplier engagement (local
                  and overseas), quotation collection, and procurement planning
                  for controlled catalogue rollout.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">
                  SKU lock controls
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Core products are defined with specification-locked
                  requirements (materials, packaging, fitment, and quality
                  constraints) to protect wholesale consistency.
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold text-white/70">
                    Internal reference
                  </div>
                  <div className="mt-1 text-sm text-white/85">
                    SKU Lock Sheet (v1.0)
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    Used for supplier compliance confirmation and SKU
                    acceptance.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">
                  Wholesale documentation
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Orders and fulfilment are designed around an invoice-first
                  structure with dispatch records and account linkage to support
                  operational auditability.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-white">
                Trade-only policy
              </div>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Maxgen Supplies operates as a trade-only division for verified
                businesses. No consumer (B2C) checkout or retail consumer supply
                is provided through this platform.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <Divider />

      {/* Product scope */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <h2 className="mx-h2">Wholesale scope (NACE 4652 aligned)</h2>
              <p className="mx-lead mt-3 text-white/80">
                Product categories are structured to match wholesale
                distribution of electronic and telecommunications accessories
                and parts.
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">
                  Mobile device protection
                </div>
                <div className="mt-4">
                  <Bullets
                    items={[
                      "Clear tempered glass screen protectors (spec-locked)",
                      "Privacy tempered glass (28–30° privacy angle, spec-locked)",
                      "Camera lens protectors (9H tempered, spec-locked)",
                      "Case-friendly fitment and retail packaging requirements",
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">
                  Telecom & electronic accessories (supporting range)
                </div>
                <div className="mt-4">
                  <Bullets
                    items={[
                      "USB-C charging cables (retail packaged)",
                      "Lightning-compatible charging cables",
                      "Wall charging adapters",
                      "Wireless charging pads",
                      "Power banks",
                      "Accessory kits (SIM tools, connectors, packaged add-ons)",
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[color:var(--mx-accent-blue)]/10 p-6">
              <div className="text-sm font-semibold text-white">
                Classification note
              </div>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Product range is positioned for wholesale supply of electronic
                and telecommunications equipment parts and accessories
                consistent with NACE 4652 classification.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <Divider />

      {/* Wholesale flow */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <h2 className="mx-h2">Wholesale flow</h2>
              <p className="mx-lead mt-3 text-white/80">
                A verification-first onboarding workflow designed to keep the
                division trade-only and documentation-ready.
              </p>
            </div>

            <Stagger>
              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                {[
                  {
                    t: "1) Apply",
                    d: "Submit trade details (business name, address, contact person, volume estimate).",
                  },
                  {
                    t: "2) Verify",
                    d: "Account is reviewed and approved for wholesale access and catalogue visibility.",
                  },
                  {
                    t: "3) Access",
                    d: "Approved accounts can view trade range and request wholesale ordering.",
                  },
                  {
                    t: "4) Invoice / Dispatch",
                    d: "Invoice-first confirmation and dispatch documentation retained for records.",
                  },
                ].map((x) => (
                  <Item key={x.t}>
                    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                      <div className="text-sm font-semibold text-white">
                        {x.t}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/80">
                        {x.d}
                      </p>
                    </div>
                  </Item>
                ))}
              </div>
            </Stagger>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/supplies/b2b"
                className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.22)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Open B2B portal
              </Link>
              <Link
                href="/supplies/apply"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Apply for a trade account
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                WhatsApp Business
              </a>
            </div>
          </div>
        </FadeIn>
      </section>

      <Divider />

      {/* Contact */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="mx-h2">Contact</h2>
                <p className="mx-lead mt-3 text-white/80">
                  For trade onboarding, procurement discussions, or wholesale
                  information, contact us directly.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs font-semibold text-white/65">
                      Email
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      <a
                        className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        href="mailto:info@maxgensys.com"
                      >
                        info@maxgensys.com
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs font-semibold text-white/65">
                      Phone
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      <a
                        className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        href="tel:+353833226565"
                      >
                        +353 83 322 6565
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
                    <div className="text-xs font-semibold text-white/65">
                      WhatsApp Business
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      <a
                        className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        href={waHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Message us on WhatsApp
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      Dublin, Ireland
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:w-[360px]">
                <div className="text-sm font-semibold text-white">
                  Next step
                </div>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Submit your trade details to request approval for catalogue
                  access and wholesale pricing.
                </p>
                <Link
                  href="/supplies/apply"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Apply for a trade account
                </Link>
                <p className="mt-3 text-xs text-white/55">
                  Verification-first access. No consumer checkout.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
