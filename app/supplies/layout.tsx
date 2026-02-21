// app/supplies/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/353833226565";
const PHONE_E164 = "+353833226565";
const PHONE_DISPLAY = "+353 83 322 6565";
const EMAIL = "info@maxgensys.com";

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

export default function SuppliesLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <div style={{ background: "var(--mx-bg)", color: "var(--mx-text)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/supplies" className="flex items-center gap-3">
            <div
              className="relative h-9 w-9 overflow-hidden rounded-md"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Image
                src="/logo.png"
                alt="Maxgen Systems"
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>

            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">
                Maxgen Systems
              </div>
              <div className="text-xs text-white/60">Maxgen Supplies</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 md:flex">
            <Link
              className="text-sm text-white/75 hover:text-white"
              href="/supplies"
            >
              Overview
            </Link>
            <Link
              className="text-sm text-white/75 hover:text-white"
              href="/supplies/b2b"
            >
              B2B Portal
            </Link>
            <Link
              className="text-sm text-white/75 hover:text-white"
              href="/supplies/apply"
            >
              Apply
            </Link>
            <Link
              className="text-sm text-white/75 hover:text-white"
              href="/supplies/contact"
            >
              Contact
            </Link>
            <Link
              className="text-sm text-white/75 hover:text-white"
              href="/supplies"
            >
              Home
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </nav>

          {/* Mobile dropdown */}
          <div className="md:hidden">
            <details className="group relative">
              <summary className="list-none">
                <span className="inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10">
                  Menu
                  <span className="text-white/60 transition group-open:rotate-180">
                    ▾
                  </span>
                </span>
              </summary>

              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/12 bg-black/80 backdrop-blur shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <div className="flex flex-col p-2">
                  <Link
                    href="/supplies"
                    className="rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/supplies/b2b"
                    className="rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    B2B Portal
                  </Link>
                  <Link
                    href="/supplies/apply"
                    className="rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Apply
                  </Link>
                  <Link
                    href="/supplies/contact"
                    className="rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/supplies"
                    className="rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Home
                  </Link>

                  <div className="my-2 h-px bg-white/10" />

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* Page content */}
      {children}

      {/* Footer (COMPACT) */}
      <footer className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-12 md:items-center">
            <div className="md:col-span-6">
              <div className="text-xs font-semibold text-white">
                Maxgen Supplies — Dublin, Ireland
              </div>

              <div className="mt-3 flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <IconMail className="h-4 w-4 text-white/60" />
                  {EMAIL}
                </a>

                <span className="hidden sm:inline text-white/30">•</span>

                <a
                  href={`tel:${PHONE_E164}`}
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <IconPhone className="h-4 w-4 text-white/60" />
                  {PHONE_DISPLAY}
                </a>

                <span className="hidden sm:inline text-white/30">•</span>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 text-white/60" />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="md:col-span-6 md:text-right">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:justify-end">
                <Link
                  href="/supplies/privacy"
                  className="text-white/70 underline decoration-white/15 underline-offset-4 hover:text-white hover:decoration-white/50"
                >
                  Privacy
                </Link>
                <Link
                  href="/supplies/terms"
                  className="text-white/70 underline decoration-white/15 underline-offset-4 hover:text-white hover:decoration-white/50"
                >
                  Terms
                </Link>
                <Link
                  href="/supplies/contact"
                  className="text-white/70 underline decoration-white/15 underline-offset-4 hover:text-white hover:decoration-white/50"
                >
                  Contact
                </Link>
                <Link
                  href="/supplies"
                  className="text-white/70 underline decoration-white/15 underline-offset-4 hover:text-white hover:decoration-white/50"
                >
                  Home
                </Link>
              </div>

              <div className="mt-3 text-[11px] text-white/45">
                © {new Date().getFullYear()} Maxgen Systems Ltd • CRO: 806565
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
