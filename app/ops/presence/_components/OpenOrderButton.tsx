"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function OpenOrderButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="underline underline-offset-4"
      onClick={() => {
        startTransition(() => {
          router.push(`/ops/presence?id=${encodeURIComponent(id)}`);
        });
      }}
    >
      Open
    </button>
  );
}
