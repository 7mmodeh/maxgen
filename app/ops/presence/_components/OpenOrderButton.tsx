"use client";

import { useRouter } from "next/navigation";

export default function OpenOrderButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      className="underline underline-offset-4"
      onClick={() => {
        router.push(`/ops/presence?id=${encodeURIComponent(id)}`);
        router.refresh();
      }}
      type="button"
    >
      Open
    </button>
  );
}
