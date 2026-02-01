"use client";

import Link from "next/link";

export default function OpenOrderButton({ id }: { id: string }) {
  return (
    <Link
      href={`/ops/presence/${encodeURIComponent(id)}`}
      className="underline underline-offset-4"
      prefetch={false}
    >
      Open
    </Link>
  );
}
