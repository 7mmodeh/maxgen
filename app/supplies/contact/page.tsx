// app/supplies/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, Stagger, Item } from "../../_components/motion";

export const metadata: Metadata = {
  title: "Contact | Maxgen Supplies",
  description:
    "Contact Maxgen Supplies (B2B wholesale division) in Dublin, Ireland. Email, phone, and WhatsApp Business.",
  alternates: { canonical: "/supplies/contact" },
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

function IconMail(props: { className?: string }) {
  const { className } = props;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 3.2-8 5-8-5V6l8 5 8-5v1.2Z"
      />
    </svg>
  );
}

function IconPhone(props: { className?: string }) {
  const { className } = props;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 10.8c1.4 2.7 3.9 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.5 2.7.8 4.2.8.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.4 22 2 13.6 2 3c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.5.3 2.9.8 4.2.1.4 0 .9-.2 1.2l-2.2 2.2Z"
      />
    </svg>
  );
}

function WhatsAppIcon(props: { className?: string }) {
  const { className } = props;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.51 2 2 6.48 2 12c0 1.99.58 3.84 1.59 5.4L2.5 22l4.79-1.05A10.03 10.03 0 0 0 12.04 22C17.57 22 22 17.52 22 12S17.57 2 12.04 2Zm0 18.2c-1.63 0-3.15-.45-4.46-1.23l-.32-.19-2.84.62.6-2.77-.2-.34A8.15 8.15 0 0 1 3.86 12c0-4.52 3.68-8.2 8.18-8.2 4.5 0 8.18 3.68 8.18 8.2 0 4.52-3.68 8.2-8.18 8.2Zm4.75-6.1c-.26-.13-1.52-.75-1.75-.83-.23-.08-.4-.13-.56.13-.16.26-.65.83-.8 1-.15.17-.3.2-.56.07-.26-.13-1.08-.39-2.06-1.25-.76-.66-1.27-1.48-1.42-1.73-.15-.26-.02-.4.11-.53.11-.11.26-.28.39-.43.13-.15.17-.26.26-.43.08-.17.04-.32-.02-.45-.06-.13-.56-1.34-.77-1.84-.2-.5-.41-.43-.56-.44h-.48c-.17 0-.45.06-.68.32-.23.26-.89.85-.89 2.08s.92 2.41 1.05 2.58c.13.17 1.78 2.69 4.28 3.78.6.26 1.06.42 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.49-.29Z"
      />
    </svg>
  );
}

export default function ContactPage() {
  const emailCompose = mailtoHref({
    subject: "Enquiry — Maxgen Supplies",
    body: "Hi Maxgen Supplies,\n\nI would like to enquire about:\n\n- \n\nBusiness name:\nLocation:\nEstimated monthly volume:\n\nThanks,\n",
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
            Maxgen Supplies — Dublin, Ireland
          </div>

          <h1 className="mx-h1 mt-5">Contact</h1>
          <p className="mx-lead mt-4 text-white/80">
            Reach us by email, phone, or WhatsApp Business. For B2B onboarding,
            include your business name and what you want to source.
          </p>
        </FadeIn>
      </header>

      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 sm:p-8 lg:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)]">
          <Stagger>
            <div className="grid gap-4 sm:grid-cols-2">
              <Item>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/65">
                    <IconMail className="h-4 w-4 text-white/70" />
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/65">
                    <IconPhone className="h-4 w-4 text-white/70" />
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
                    href="https://wa.me/353833226565?text=Hi%20Maxgen%20Supplies%2C%20I%20would%20like%20to%20enquire%20about%20B2B%20wholesale."
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
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
                  B2B Portal
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
            For wholesale onboarding, include: business name, address, preferred
            categories (screen protectors / lens protectors / MagSafe /
            charging), and an estimated monthly volume.
          </p>
        </div>
      </section>
    </main>
  );
}
