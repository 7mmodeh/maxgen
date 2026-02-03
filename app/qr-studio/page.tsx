// app/qr-studio/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import { hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";
import QrCheckoutButtons from "./_components/QrCheckoutButtons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QrStudioPage() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);

  const { data: projects } = await sb
    .from("qr_projects")
    .select(
      "id,business_name,url,template_id,template_version,logo_path,updated_at",
    )
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Maxgen QR Studio</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Static, scanner-safe QR codes. ECC H. Quiet zone enforced. Templates
            T1–T3 only.
          </p>
        </div>

        {entitled ? (
          <Link
            href="/qr-studio/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Create QR Project
          </Link>
        ) : null}
      </div>

      {!entitled ? (
        <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Unlock QR Studio</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Choose monthly or one-time access. Print Pack sold separately.
          </p>
          <div className="mt-4">
            <QrCheckoutButtons />
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your QR Projects</h2>
            <span className="text-xs text-neutral-500">
              {projects?.length ?? 0} total
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {(projects ?? []).map((p) => (
              <Link
                key={p.id}
                href={`/qr-studio/${p.id}`}
                className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.business_name}</div>
                    <div className="mt-1 text-xs text-neutral-600">{p.url}</div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {p.template_id} v{p.template_version}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!projects || projects.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-600">
              No projects yet. Create your first QR project.
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
