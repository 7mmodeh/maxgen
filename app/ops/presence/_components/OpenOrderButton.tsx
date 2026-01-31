"use client";

import Link from "next/link";

export default function OpenOrderButton({ id }: { id: string }) {
  const href = `/ops/presence?id=${encodeURIComponent(id)}`;

  return (
    <Link href={href} className="underline underline-offset-4" prefetch={false}>
      Open
    </Link>
  );
}
