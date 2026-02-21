"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WHATSAPP_URL = "https://wa.me/353833226565";
const PHONE_E164 = "+353833226565";
const PHONE_DISPLAY = "+353 83 322 6565";
const EMAIL = "info@maxgensys.com";

type NavItem = { href: string; label: string };

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/supplies", label: "Overview" },
  { href: "/supplies/b2b", label: "B2B Portal" },
  { href: "/supplies/apply", label: "Apply" },
  { href: "/supplies/contact", label: "Contact" },
] as const;

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

function isActiveRoute(pathname: string, href: string): boolean {
  // Critical fix: Overview must be exact ONLY.
  if (href === "/supplies") return pathname === "/supplies";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink(props: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const { href, label, pathname, onClick } = props;

  const active = isActiveRoute(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "relative inline-flex items-center rounded-xl px-2.5 py-2 text-sm transition",
        active ? "text-white font-semibold" : "text-white/75 hover:text-white",
        // Subtle hover glow (active stronger, inactive softer)
        active
          ? "hover:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
          : "hover:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]",
      ].join(" ")}
    >
      {label}

      {active ? (
        <span
          className="absolute -bottom-1 left-2 right-2 h-[2px] rounded-full"
          style={{ background: "var(--mx-light-accent)" }}
        />
      ) : null}
    </Link>
  );
}

export default function SuppliesLayout(props: { children: ReactNode }) {
  const { children } = props;
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? "";

  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileButtonLabel = useMemo(() => {
    const active = NAV_ITEMS.find((x) => isActiveRoute(pathname, x.href));
    return active ? active.label : "Menu";
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((v) => !v);

  return (
    <div style={{ background: "var(--mx-bg)", color: "var(--mx-text)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo (Home -> /supplies) */}
          <Link href="/supplies" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-md border border-white/10 bg-white/5">
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

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((x) => (
              <NavLink
                key={x.href}
                href={x.href}
                label={x.label}
                pathname={pathname}
              />
            ))}

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="ml-3 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:shadow-[0_0_0_4px_rgba(56,189,248,0.10)]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </nav>

          {/* Mobile Nav */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={toggleMobile}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10"
              aria-expanded={mobileOpen}
              aria-controls="supplies-mobile-menu"
            >
              {mobileButtonLabel}
              <span className="text-white/60">{mobileOpen ? "▲" : "▼"}</span>
            </button>

            {mobileOpen ? (
              <div
                id="supplies-mobile-menu"
                className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/12 bg-black/80 p-2 backdrop-blur"
              >
                <div className="flex flex-col">
                  {NAV_ITEMS.map((x) => (
                    <NavLink
                      key={x.href}
                      href={x.href}
                      label={x.label}
                      pathname={pathname}
                      onClick={closeMobile} // ✅ auto close on click
                    />
                  ))}

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobile}
                    className="mt-1 inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:shadow-[0_0_0_4px_rgba(56,189,248,0.10)]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {children}

      {/* Compact Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-white/60 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>Maxgen Supplies — Dublin, Ireland</div>

            <div className="flex flex-wrap gap-4">
              <a href={`mailto:${EMAIL}`} className="hover:text-white">
                {EMAIL}
              </a>
              <a href={`tel:${PHONE_E164}`} className="hover:text-white">
                {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
              <Link href="/supplies/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/supplies/terms" className="hover:text-white">
                Terms
              </Link>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-white/40">
            © {new Date().getFullYear()} Maxgen Systems Ltd • CRO: 806565
          </div>
        </div>
      </footer>
    </div>
  );
}
