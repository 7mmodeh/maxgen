"use client";

import { useRouter } from "next/navigation";

export default function OpenOrderButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="underline underline-offset-4"
      onClick={() => {
        const href = `/ops/presence?id=${encodeURIComponent(id)}`;
        router.push(href);
        router.refresh(); // forces the /ops/presence server component to re-run with new searchParams
      }}
    >
      Open
    </button>
  );
}
