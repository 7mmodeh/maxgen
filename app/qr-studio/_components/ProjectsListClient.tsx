"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Project = {
  id: string;
  business_name: string;
  url: string;
  template_id: string;
  template_version: number;
  updated_at: string;
};

async function apiDeleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/qr/project?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(json?.error || `Delete failed (${res.status})`);
  }
}

export default function ProjectsListClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const total = useMemo(() => projects.length, [projects]);

  async function onDelete(p: Project) {
    setErr(null);

    const ok = window.confirm(
      `Delete project "${p.business_name}"?\n\nThis cannot be undone.\nDeleting does NOT restore your creation allowance.`,
    );
    if (!ok) return;

    // Optimistic remove
    const prev = projects;
    setBusyId(p.id);
    setProjects((cur) => cur.filter((x) => x.id !== p.id));

    try {
      await apiDeleteProject(p.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Roll back
      setProjects(prev);
      setErr(msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-3">
      {err ? (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {err}
        </div>
      ) : null}

      <div className="text-xs text-white/60">
        Showing <span className="font-semibold text-white">{total}</span>{" "}
        project{total === 1 ? "" : "s"}.
      </div>

      {projects.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-white/10 bg-black/20 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link href={`/qr-studio/${p.id}`} className="block">
                <div className="text-sm font-semibold hover:underline">
                  {p.business_name}
                </div>
                <div className="mt-1 text-xs text-white/60 break-all">
                  {p.url}
                </div>
                <div className="mt-2 text-xs text-white/60">
                  {p.template_id} v{p.template_version}
                </div>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/qr-studio/${p.id}`}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10"
              >
                Open
              </Link>

              <button
                onClick={() => onDelete(p)}
                disabled={busyId === p.id}
                className="rounded-md border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/15 disabled:opacity-60"
              >
                {busyId === p.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-black/10 p-6 text-sm text-white/70">
          No projects yet. Create your first QR project.
        </div>
      ) : null}
    </div>
  );
}
