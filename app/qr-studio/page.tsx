import Link from "next/link";
import QRCode from "qrcode";
import { supabaseServer } from "@/src/lib/supabase/server";
import { hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";
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

  const entitled = user ? await hasQrStudioEntitlement(user.id) : false;

  const [t1Svg, t2Svg, t3Svg] = await Promise.all([
    demoSvg("https://maxgensys.com/qr-demo-t1"),
    demoSvg("https://maxgensys.com/qr-demo-t2"),
    demoSvg("https://maxgensys.com/qr-demo-t3"),
  ]);

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
                href={user ? "/qr-studio/dashboard" : "/login"}
                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                {user ? "My Projects" : "Log in"}
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
                href={user ? "/qr-studio/dashboard" : "/signup"}
                className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
              >
                {user ? "Open dashboard" : "Create account"}
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

          {/* FIXED LAYOUT: stable checkout width on desktop; stacks nicely on smaller screens */}
          <div className="mt-6 grid gap-4 lg:[grid-template-columns:1fr_420px] xl:[grid-template-columns:1fr_460px]">
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
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm font-semibold">Checkout</div>
              <div className="mt-2 text-xs text-white/60">
                Purchase unlocks access via server-side entitlements. Limits are
                enforced automatically.
              </div>

              {/* Let checkout breathe */}
              <div className="mt-4">
                <QrCheckoutButtons />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-black/30 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xl font-semibold">
                Generate your first QR in 60 seconds.
              </div>
              <div className="mt-1 text-sm text-white/70">
                Pay → Create → Download → Done.
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
                href={user ? "/qr-studio/dashboard" : "/signup"}
                className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
              >
                {user ? "Open dashboard" : "Create account"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
