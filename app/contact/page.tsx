// app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, Stagger, Item } from "../_components/motion";

export const metadata: Metadata = {
  title: "Contact | Maxgen Systems Ltd",
  description:
    "Contact Maxgen Systems Ltd in Dublin, Ireland. Email, phone, and WhatsApp Business.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

function mailtoHref(args: { subject: string; body?: string }): string {
  const email = "info@maxgensys.com";
  const subject = encodeURIComponent(args.subject);
  const body = encodeURIComponent(args.body ?? "");
  const query = body
    ? `?subject=${subject}&body=${body}`
    : `?subject=${subject}`;
  return `mailto:${email}${query}`;
}

export default function ContactPage() {
  const emailCompose = mailtoHref({
    subject: "Enquiry — Maxgen Systems",
    body: "Hi Maxgen Systems,\n\nI would like to enquire about:\n\n- \n\nThanks,\n",
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[color:var(--mx-accent-blue)]/18 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-[color:var(--mx-light-accent)]/14 blur-[120px]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <header className="relative mx-auto w-full max-w-5xl px-4 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8">
        <FadeIn>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--mx-light-accent)]" />
            Maxgen Systems Ltd — Dublin, Ireland
          </div>

          <h1 className="mx-h1 mt-5">Contact</h1>
          <p className="mx-lead mt-4 text-white/80">
            Reach us by email, phone, or WhatsApp Business. For B2B onboarding,
            include your business name and a short description of what you need.
          </p>
        </FadeIn>
      </header>

      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 sm:p-8 lg:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)]">
          <Stagger>
            <div className="grid gap-4 sm:grid-cols-2">
              <Item>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
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

                  <a
                    href={emailCompose}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.24)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    Compose Email
                  </a>
                </div>
              </Item>

              <Item>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-xs font-semibold text-white/65">
                    Phone & WhatsApp
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    <a
                      className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                      href="tel:+353833226565"
                    >
                      +353 83 322 6565
                    </a>
                  </div>

                  <a
                    href="https://wa.me/353833226565?text=Hi%20Maxgen%20Systems%2C%20I%20would%20like%20to%20enquire%20about%20your%20services."
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    WhatsApp Business
                  </a>
                </div>
              </Item>
            </div>
          </Stagger>

          <FadeIn delay={0.06}>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="text-sm font-semibold text-white">
                Quick links
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/supplies/b2b"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Maxgen Supplies B2B
                </Link>
                <Link
                  href="/supplies/apply"
                  className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.20)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Apply for Trade Account
                </Link>
              </div>
            </div>
          </FadeIn>

          <p className="mt-6 text-xs text-white/55">
            If you are contacting about wholesale onboarding, include your
            business name, address, and preferred categories (screen protectors,
            lens protectors, MagSafe, charging).
          </p>
        </div>
      </section>
    </main>
  );
}
