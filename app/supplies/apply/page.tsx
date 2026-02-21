// app/supplies/apply/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "../../_components/motion";
import TradeApplyForm from "./_components/TradeApplyForm";

export const metadata: Metadata = {
  title: "Apply for a Trade Account | Maxgen Supplies (B2B)",
  description:
    "Apply for a Maxgen Supplies trade account (B2B wholesale). Verification-first access to controlled SKUs, trade pricing (ex VAT), and invoice-based ordering.",
  alternates: { canonical: "/supplies/apply" },
  robots: { index: true, follow: true },
};

export default function TradeApplyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[color:var(--mx-accent-blue)]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-[color:var(--mx-light-accent)]/16 blur-[120px]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <header className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-14 lg:px-8">
        <FadeIn>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--mx-light-accent)]" />
            Maxgen Supplies — Trade Account Application
          </div>

          <h1 className="mx-h1 mt-5 max-w-4xl">
            Apply for a verified B2B trade account
            <span className="block text-white/70">
              Wholesale access, controlled SKUs, invoice-based ordering
            </span>
          </h1>

          <p className="mx-lead mt-4 max-w-3xl text-white/80">
            This application is for businesses only (retailers, repair centres,
            resellers). We verify applicants before enabling catalogue access
            and trade pricing.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/supplies/b2b"
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Back to B2B overview
            </Link>
            <a
              href="https://wa.me/353833226565?text=Hi%20Maxgen%20Supplies%2C%20I%20want%20to%20apply%20for%20a%20B2B%20trade%20account.%20Please%20advise%20the%20next%20steps."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              WhatsApp Business
            </a>
          </div>

          <p className="mt-3 text-xs text-white/60">
            Submitting will open your email client and send the formatted
            application to{" "}
            <span className="font-semibold text-white/80">
              info@maxgensys.com
            </span>
            .
          </p>
        </FadeIn>
      </header>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <TradeApplyForm />
      </section>
    </main>
  );
}
