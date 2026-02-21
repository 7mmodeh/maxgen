// app/supplies/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/353833226565";
const PHONE_E164 = "+353833226565";
const PHONE_DISPLAY = "+353 83 322 6565";
const EMAIL = "info@maxgensys.com";

function WhatsAppIcon(props: { className?: string }) {
  const { className } = props;
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M19.11 17.41c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.34-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.63 1.12 2.81.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.57.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
      />
      <path
        fill="currentColor"
        d="M16.02 5.33c-5.88 0-10.67 4.79-10.67 10.67 0 1.88.49 3.72 1.42 5.34L5.18 26.6l5.42-1.54c1.56.85 3.31 1.3 5.42 1.3 5.88 0 10.67-4.79 10.67-10.67 0-5.88-4.79-10.67-10.67-10.67zm0 19.2c-1.88 0-3.61-.54-5.05-1.46l-.36-.23-3.21.91.94-3.12-.24-.36c-.98-1.48-1.5-3.2-1.5-4.98 0-5.1 4.15-9.25 9.25-9.25 5.1 0 9.25 4.15 9.25 9.25 0 5.1-4.15 9.25-9.25 9.25z"
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
          <Link href="/" className="flex items-center gap-3">
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
              href="/contact"
            >
              Contact
            </Link>
            <Link className="text-sm text-white/75 hover:text-white" href="/">
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

          {/* Mobile dropdown menu (no auth, navigation only) */}
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
                    href="/contact"
                    className="rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/"
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

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <div className="md:col-span-6">
              <div className="text-sm font-semibold text-white">
                Maxgen Supplies — B2B Wholesale Division
              </div>
              <div className="mt-2 text-sm text-white/70">Dublin, Ireland</div>

              <div className="mt-4 space-y-2 text-sm text-white/75">
                <div>
                  Email:{" "}
                  <a
                    className="font-semibold text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                    href={`mailto:${EMAIL}`}
                  >
                    {EMAIL}
                  </a>
                </div>
                <div>
                  Phone:{" "}
                  <a
                    className="font-semibold text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                    href={`tel:${PHONE_E164}`}
                  >
                    {PHONE_DISPLAY}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/75">WhatsApp:</span>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-semibold text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                {/* CHANGED HERE to /supplies/privacy and /supplies/terms */}
                <Link
                  href="/supplies/privacy"
                  className="text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/60"
                >
                  Privacy
                </Link>
                <Link
                  href="/supplies/terms"
                  className="text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/60"
                >
                  Terms
                </Link>
                <Link
                  href="/contact"
                  className="text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/60"
                >
                  Contact
                </Link>
                <Link
                  href="/"
                  className="text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/60"
                >
                  Home
                </Link>
              </div>

              <div className="mt-6 text-xs text-white/55">
                © {new Date().getFullYear()} Maxgen Systems Ltd. All rights
                reserved.
                <span className="mx-2">•</span>
                Maxgen Systems Ltd (Ireland) — CRO: 806565
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
