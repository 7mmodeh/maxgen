// app/qr-studio/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import { hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QrStudioDashboardPage() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio#pricing");

  const { data: projects } = await sb
    .from("qr_projects")
    .select("id,business_name,url,template_id,template_version,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs text-white/60">Maxgen QR Studio</div>
            <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-sm text-white/70">
              Create projects, download PNG/SVG. Templates T1–T3 only.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/qr-studio"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to product page
            </Link>
            <Link
              href="/qr-studio/new"
              className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Create QR Project
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your projects</h2>
            <span className="text-xs text-white/60">
              {projects?.length ?? 0} total
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {(projects ?? []).map((p) => (
              <Link
                key={p.id}
                href={`/qr-studio/${p.id}`}
                className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-black/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">
                      {p.business_name}
                    </div>
                    <div className="mt-1 text-xs text-white/60 break-all">
                      {p.url}
                    </div>
                  </div>
                  <div className="text-xs text-white/60">
                    {p.template_id} v{p.template_version}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!projects || projects.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/10 p-6 text-sm text-white/70">
              No projects yet. Create your first QR project.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
