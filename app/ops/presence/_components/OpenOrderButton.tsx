"use client";

import Link from "next/link";

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export default function OpenOrderButton({ id }: { id: unknown }) {
  const raw = typeof id === "string" ? id : id == null ? "" : String(id);
  const safeId = raw.trim();

  if (!isUuid(safeId)) {
    return (
      <span className="text-xs opacity-70">
        BAD_ID: <span className="font-mono">{safeId || "(empty)"}</span>
      </span>
    );
  }

  return (
    <Link
      href={`/ops/presence/${encodeURIComponent(safeId)}`}
      className="underline underline-offset-4"
      prefetch={false}
    >
      Open
    </Link>
  );
}
