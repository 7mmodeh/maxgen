import Link from "next/link";

type SearchParams = {
  session_id?: string;
  return_to?: string;
};

function safeReturnTo(
  v: string | null,
): "/presence" | "/qr-studio/dashboard" | "/account" {
  if (!v) return "/account";

  // allowlist only (prevents open-redirect)
  if (v === "/presence") return "/presence";
  if (v === "/qr-studio/dashboard") return "/qr-studio/dashboard";
  if (v === "/account") return "/account";

  return "/account";
}

export default function BillingSuccessPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sessionId = searchParams?.session_id ?? null;
  const returnToRaw = searchParams?.return_to ?? null;
  const returnTo = safeReturnTo(returnToRaw);

  const isQr = returnTo.startsWith("/qr-studio");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="mt-2 text-sm opacity-80">
        Thanks — your purchase is being activated. If this is a subscription,
        access may take a few seconds to reflect.
      </p>

      {sessionId ? (
        <div className="mt-6 rounded-xl border p-4 text-sm">
          <div className="opacity-70">Stripe session</div>
          <div className="font-mono break-all">{sessionId}</div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={returnTo}
          className="rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Continue
        </Link>

        <Link
          href="/account"
          className="rounded-lg px-5 py-3 text-sm font-semibold border"
        >
          Go to Account
        </Link>

        {isQr ? (
          <Link
            href="/qr-studio"
            className="rounded-lg px-5 py-3 text-sm font-semibold border"
          >
            Back to QR Studio
          </Link>
        ) : (
          <Link
            href="/online-presence"
            className="rounded-lg px-5 py-3 text-sm font-semibold border"
          >
            Back to Online Presence
          </Link>
        )}
      </div>
    </main>
  );
}
