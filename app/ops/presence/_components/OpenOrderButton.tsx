"use client";

import { useRouter } from "next/navigation";

export default function OpenOrderButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="underline underline-offset-4"
      onClick={(e) => {
        // prevent any parent click handlers / overlays from hijacking the click
        e.preventDefault();
        e.stopPropagation();

        const href = `/ops/presence?id=${encodeURIComponent(id)}`;
        router.push(href);
        router.refresh(); // force server component re-run so detail branch renders
      }}
    >
      Open
    </button>
  );
}
