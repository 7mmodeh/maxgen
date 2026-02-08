// app/qr-studio/[id]/print-pack/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import {
  hasQrPrintPackEntitlement,
  hasQrStudioEntitlement,
} from "@/src/lib/qr/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QrPrintPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const [hasStudio, hasPack] = await Promise.all([
    hasQrStudioEntitlement(user.id),
    hasQrPrintPackEntitlement(user.id),
  ]);

  if (!hasStudio) redirect("/qr-studio#pricing");
  if (!hasPack) redirect(`/qr-studio/${id}`);

  // Ownership gate
  const { data: proj, error } = await sb
    .from("qr_projects")
    .select("id,user_id,business_name,url")
    .eq("id", id)
    .maybeSingle();

  if (error || !proj || proj.user_id !== user.id) {
    redirect("/qr-studio/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs text-white/60">Maxgen QR Studio</div>
            <h1 className="mt-1 text-2xl font-semibold">
              Print Pack (Premium)
            </h1>
            <p className="mt-2 text-sm text-white/70 break-all">
              Project:{" "}
              <span className="font-semibold">{proj.business_name}</span> ·{" "}
              <span className="text-white/60">{proj.url}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/qr-studio/${id}`}
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to Project
            </Link>

            <Link
              href="/qr-studio/dashboard"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6">
          <div className="text-sm font-semibold text-emerald-100">
            Print Pack access is active for your account.
          </div>
          <div className="mt-2 text-sm text-emerald-100/80">
            Next step (M-QR-PRINT-02): build the premium printable form
            (business card / flyer / etc.), logo upload, and ultra high-quality
            output generation.
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold">Coming next</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>• Choose print template: business card, flyer, etc.</li>
            <li>
              • Fill business info (name, role, phone, email, address, socials)
            </li>
            <li>• Upload logo (re-use existing QR logo storage if desired)</li>
            <li>• Generate print-ready files (high DPI, bleed/safe area)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
