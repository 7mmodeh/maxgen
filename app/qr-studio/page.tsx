import Link from "next/link";
import QRCode from "qrcode";
import { supabaseServer } from "@/src/lib/supabase/server";
import {
  getQrStudioPlan,
  hasQrPrintPackEntitlement,
  hasQrStudioEntitlement,
} from "@/src/lib/qr/entitlement";
import QrCheckoutButtons from "./_components/QrCheckoutButtons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function demoSvg(value: string): Promise<string> {
  const svg = await QRCode.toString(value, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 240,
  });

  return svg
    .replace(/width="[^"]*"/g, "")
    .replace(/height="[^"]*"/g, "")
    .replace("<svg", '<svg preserveAspectRatio="xMidYMid meet"');
}

export default async function QrStudioLandingPage() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user ?? null;

  // Robust, server-side purchase state
  const [entitled, qrStudioPlan, hasPrintPack] = user
    ? await Promise.all([
        hasQrStudioEntitlement(user.id),
        getQrStudioPlan(user.id),
        hasQrPrintPackEntitlement(user.id),
      ])
    : ([false, null, false] as const);

  const [t1Svg, t2Svg, t3Svg] = await Promise.all([
    demoSvg("https://maxgensys.com/qr-demo-t1"),
    demoSvg("https://maxgensys.com/qr-demo-t2"),
    demoSvg("https://maxgensys.com/qr-demo-t3"),
  ]);

  const authed = !!user;

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">MaxGen Systems</div>
            <div className="text-xs text-white/60">QR Studio</div>
          </div>
          <div className="flex gap-2">
            {entitled ? (
              <Link
                href="/qr-studio/dashboard"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
              >
                Open Dashboard
              </Link>
            ) : (
              <Link
                href={authed ? "/qr-studio/dashboard" : "/login"}
                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                {authed ? "My Projects" : "Log in"}
              </Link>
            )}
          </div>
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              ECC H • Quiet Zone • Templates T1–T3 • PNG + SVG
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              Clean QR codes that look{" "}
              <span className="text-white/70">premium</span> and scan fast.
            </h1>

            <p className="mt-4 text-base text-white/70">
              Built for businesses who want a professional QR without
              complexity. No design sliders. No confusing options. Just safe
              templates and perfect output.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                View pricing
              </a>

              <Link
                href={authed ? "/qr-studio/dashboard" : "/signup"}
                className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
              >
                {authed ? "Open dashboard" : "Create account"}
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Scanner-safe</div>
                <div className="mt-1 text-xs text-white/60">
                  ECC H + enforced quiet zone.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Locked templates</div>
                <div className="mt-1 text-xs text-white/60">
                  No design mistakes possible.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Instant export</div>
                <div className="mt-1 text-xs text-white/60">
                  PNG 1024 + clean SVG.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Templates (examples)</div>
              <div className="text-xs text-white/60">What customers get</div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="rounded-lg bg-white p-3">
                  <div
                    className="[&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
                    dangerouslySetInnerHTML={{ __html: t1Svg }}
                  />
                </div>
                <div className="mt-3 text-sm font-semibold">T1</div>
                <div className="mt-1 text-xs text-white/60">Clean</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="rounded-lg bg-white p-3">
                  <div
                    className="[&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
                    dangerouslySetInnerHTML={{ __html: t2Svg }}
                  />
                </div>
                <div className="mt-3 text-sm font-semibold">T2</div>
                <div className="mt-1 text-xs text-white/60">Clean + label</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="rounded-lg bg-white p-3">
                  <div
                    className="[&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
                    dangerouslySetInnerHTML={{ __html: t3Svg }}
                  />
                </div>
                <div className="mt-3 text-sm font-semibold">T3</div>
                <div className="mt-1 text-xs text-white/60">Scan-max</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold">How it works</div>
              <div className="mt-2 grid gap-2 text-sm text-white/70">
                <div>
                  <span className="font-semibold text-white">1)</span> Choose a
                  template
                </div>
                <div>
                  <span className="font-semibold text-white">2)</span> Add your
                  link + optional logo (not allowed on T3)
                </div>
                <div>
                  <span className="font-semibold text-white">3)</span> Download
                  PNG/SVG
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Pricing</h2>
              <p className="mt-2 text-sm text-white/70">
                Static QR only. No redirects. No analytics. No tracking.
              </p>
            </div>
            {entitled ? (
              <Link
                href="/qr-studio/dashboard"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
              >
                Open Dashboard
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 lg:[grid-template-columns:1fr_440px] xl:[grid-template-columns:1fr_480px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold">
                Rules & limits (read before purchase)
              </div>

              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  <span className="font-semibold text-white">
                    One-time (€9):
                  </span>{" "}
                  1 QR project total (lifetime). Deleting does not restore it.
                </li>
                <li>
                  <span className="font-semibold text-white">
                    Monthly (€7/month):
                  </span>{" "}
                  up to 5 new projects per rolling 7 days, and up to 20 per
                  rolling 30 days.
                </li>
                <li>
                  <span className="font-semibold text-white">Edits:</span> each
                  project can be edited once (lifetime). After that, it locks
                  (downloads still work).
                </li>
                <li>
                  <span className="font-semibold text-white">Templates:</span>{" "}
                  T1–T3 only. No custom shapes, colors, or analytics.
                </li>
                <li>
                  <span className="font-semibold text-white">Output:</span> PNG
                  1024×1024 + clean SVG. Static only.
                </li>
                <li>
                  <span className="font-semibold text-white">
                    Print Pack (€19 add-on):
                  </span>{" "}
                  optional upgrade for print-focused delivery (shown in your
                  dashboard once owned).
                </li>
              </ul>

              {/* Print Pack info block */}
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      Print Pack add-on
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      A one-time upgrade for businesses who print QRs for
                      signage, menus, stickers, flyers, and shop displays.
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    One-time
                  </div>
                </div>

                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li>
                    <span className="font-semibold text-white">Purpose:</span>{" "}
                    print-ready assets and guidance for consistent physical
                    deployment.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Where:</span>{" "}
                    appears in your dashboard after purchase (server-side
                    entitlement).
                  </li>
                  <li>
                    <span className="font-semibold text-white">Note:</span> QR
                    remains static (no tracking/analytics).
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm font-semibold">Checkout</div>
              <div className="mt-2 text-xs text-white/60">
                Purchase unlocks access via server-side entitlements. Limits are
                enforced automatically.
              </div>

              <div className="mt-4">
                <QrCheckoutButtons
                  authed={authed}
                  qrStudioPlan={qrStudioPlan}
                  hasPrintPack={hasPrintPack}
                />
              </div>

              {authed && qrStudioPlan ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/70">
                    Current access:
                    <span className="ml-2 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-white/80">
                      {qrStudioPlan === "monthly" ? "Monthly" : "One-time"}
                    </span>
                    {hasPrintPack ? (
                      <span className="ml-2 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-white/80">
                        Print Pack
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Local legal (QR Studio only) */}
        <section className="mt-14 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Legal (QR Studio)</div>
            <div className="mt-2 text-sm text-white/70">
              These policies apply to the QR Studio product only. Later you can
              replace these with global company policies and per-service pages.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="#privacy"
                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                Terms of Service
              </a>
              <a
                href="#pricing"
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Back to pricing
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold">Summary (what you buy)</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <span className="font-semibold text-white">
                  Static QR only:
                </span>{" "}
                no redirects, no analytics, no tracking.
              </li>
              <li>
                <span className="font-semibold text-white">Templates:</span> T1
                – T3 (deterministic, scanner-safe).
              </li>
              <li>
                <span className="font-semibold text-white">Safety:</span> ECC H
                + enforced quiet zone.
              </li>
              <li>
                <span className="font-semibold text-white">Outputs:</span> PNG
                1024×1024 + clean SVG.
              </li>
              <li>
                <span className="font-semibold text-white">Optional:</span>{" "}
                Print Pack add-on for print-focused delivery (dashboard unlock).
              </li>
            </ul>
          </div>
        </section>

        <section
          id="privacy"
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 scroll-mt-24"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Privacy Policy (QR Studio)
              </h2>
              <div className="mt-1 text-xs text-white/60">
                Jurisdiction: Ireland / EU (GDPR). Contact:{" "}
                <a className="underline" href="mailto:info@maxgensys.com">
                  info@maxgensys.com
                </a>
              </div>
            </div>
            <a
              href="#terms"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Jump to Terms
            </a>
          </div>

          <div className="mt-6 space-y-5 text-sm text-white/70">
            <div>
              <div className="text-sm font-semibold text-white">
                What this covers
              </div>
              <div className="mt-1">
                This Privacy Policy applies only to the Maxgen QR Studio feature
                available at <span className="text-white/80">/qr-studio</span>.
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Data we process
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Account identity (via Supabase Auth): user ID and basic auth
                  metadata needed to provide access.
                </li>
                <li>
                  Project content you submit: business name, optional tagline,
                  URL, selected template (T1–T3), and optional logo file.
                </li>
                <li>
                  Usage events for enforcing plan limits: create events logged
                  in <span className="text-white/80">qr_usage_events</span>.
                  Deleting projects does not restore usage counts.
                </li>
                <li>
                  Billing and entitlement state from Stripe (via server-side
                  webhooks) to determine access status.
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Why we process it (legal bases)
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <span className="text-white/80">Contract:</span> to deliver QR
                  generation outputs you request and provide your dashboard.
                </li>
                <li>
                  <span className="text-white/80">Legitimate interests:</span>{" "}
                  to prevent abuse and enforce product usage limits fairly.
                </li>
                <li>
                  <span className="text-white/80">Legal obligations:</span>{" "}
                  accounting/tax and regulatory compliance where applicable.
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Storage and sharing
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Logo files (if uploaded) are stored in Supabase Storage under
                  a user/project path.
                </li>
                <li>
                  We do not sell your personal data. We share data only with
                  necessary processors to operate the service (e.g., Stripe for
                  billing, Supabase for hosting/auth/storage).
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Retention and deletion
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  You can delete QR projects. Deletion removes the project
                  record, but does not restore usage allowances.
                </li>
                <li>
                  Usage event records are retained to enforce rolling-window and
                  lifetime limits.
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Your rights (GDPR)
              </div>
              <div className="mt-1">
                You can request access, rectification, deletion (where
                applicable), restriction, portability, and object to certain
                processing. Contact{" "}
                <a className="underline" href="mailto:info@maxgensys.com">
                  info@maxgensys.com
                </a>
                .
              </div>
            </div>
          </div>
        </section>

        <section
          id="terms"
          className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-8 scroll-mt-24"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Terms of Service (QR Studio)
              </h2>
              <div className="mt-1 text-xs text-white/60">
                Jurisdiction: Ireland / EU. Contact:{" "}
                <a className="underline" href="mailto:info@maxgensys.com">
                  info@maxgensys.com
                </a>
              </div>
            </div>
            <a
              href="#privacy"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to Privacy
            </a>
          </div>

          <div className="mt-6 space-y-5 text-sm text-white/70">
            <div>
              <div className="text-sm font-semibold text-white">
                Product scope
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  QR Studio generates{" "}
                  <span className="text-white/80">static</span> QR codes only.
                  No analytics. No redirects. No dynamic URLs.
                </li>
                <li>
                  Templates are locked to{" "}
                  <span className="text-white/80">T1–T3</span>. No custom shapes
                  or colors.
                </li>
                <li>
                  Technical safety defaults:{" "}
                  <span className="text-white/80">ECC H</span> and enforced
                  quiet zone.
                </li>
                <li>
                  Logo limit: logo may be used on T1/T2 only and should not
                  exceed <span className="text-white/80">22%</span> of the QR
                  area. <span className="text-white/80">T3</span> does not allow
                  a logo.
                </li>
                <li>
                  Exports: <span className="text-white/80">PNG 1024×1024</span>{" "}
                  and <span className="text-white/80">clean SVG</span>.
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Plans and usage limits (authoritative)
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <span className="text-white/80">One-time (€9):</span> exactly{" "}
                  <span className="text-white/80">1</span> QR project total
                  (lifetime). Deleting does not restore allowance.
                </li>
                <li>
                  <span className="text-white/80">Monthly (€7/month):</span>{" "}
                  maximum <span className="text-white/80">5</span> new projects
                  per rolling 7 days and{" "}
                  <span className="text-white/80">20</span> new projects per
                  rolling 30 days. Deleting does not reduce counts.
                </li>
                <li>
                  <span className="text-white/80">Edits:</span> each project can
                  be edited once (lifetime). After the edit, the project locks
                  for further edits (downloads still work).
                </li>
                <li>
                  Counting is enforced via server-side usage events (
                  <span className="text-white/80">qr_usage_events</span>) with{" "}
                  <span className="text-white/80">{'event = "create"'}</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Billing and access
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Access is determined by server-side entitlements derived from
                  Stripe webhooks (source of truth).
                </li>
                <li>
                  Subscription cancellation is handled via the Stripe Billing
                  Portal and typically cancels at period end.
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Acceptable use
              </div>
              <div className="mt-1">
                You are responsible for the URL/content you encode and any
                rights to logos you upload. Do not use QR Studio for unlawful,
                deceptive, or infringing content.
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Service availability and warranties
              </div>
              <div className="mt-1">
                QR Studio is provided “as is” and “as available”. We aim for
                reliable operation, but uninterrupted service is not guaranteed.
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Contact and disputes
              </div>
              <div className="mt-1">
                For support or legal requests, contact{" "}
                <a className="underline" href="mailto:info@maxgensys.com">
                  info@maxgensys.com
                </a>
                . Jurisdiction is Ireland / EU.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-white/10 bg-black/30 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xl font-semibold">
                Generate your first QR in 60 seconds.
              </div>
              <div className="mt-1 text-sm text-white/70">
                Pay → Create → Download → Done.
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a className="text-white/70 hover:text-white" href="#privacy">
                  Privacy
                </a>
                <a className="text-white/70 hover:text-white" href="#terms">
                  Terms
                </a>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="#pricing"
                className="rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                Choose plan
              </a>
              <Link
                href={authed ? "/qr-studio/dashboard" : "/signup"}
                className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
              >
                {authed ? "Open dashboard" : "Create account"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
