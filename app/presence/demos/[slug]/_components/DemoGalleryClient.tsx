"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { DemoGalleryImage } from "@/src/lib/presence-demo/types";

type Props = {
  images: readonly DemoGalleryImage[];
};

export default function DemoGalleryClient(props: Props) {
  const images = props.images;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const active = useMemo(() => {
    if (openIndex === null) return null;
    return images[openIndex] ?? null;
  }, [images, openIndex]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, idx) => (
          <button
            key={`${img.src}-${idx}`}
            type="button"
            onClick={() => setOpenIndex(idx)}
            className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            aria-label={`Open image: ${img.alt}`}
          >
            <div className="relative aspect-[4/3] w-full bg-neutral-50">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                priority={idx < 2}
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-neutral-900">
                {img.caption ?? "Recent work"}
              </p>
              <p className="mt-1 text-xs text-neutral-600">Tap to enlarge</p>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {active.caption ?? "Preview"}
                </p>
                <p className="text-xs text-neutral-600">{active.alt}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                onClick={() => setOpenIndex(null)}
              >
                Close
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full bg-neutral-50">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                onClick={() =>
                  setOpenIndex((s) => (s === null ? 0 : Math.max(0, s - 1)))
                }
                disabled={openIndex === 0}
              >
                Prev
              </button>

              <p className="text-xs text-neutral-600">
                {openIndex !== null
                  ? `${openIndex + 1} / ${images.length}`
                  : ""}
              </p>

              <button
                type="button"
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                onClick={() =>
                  setOpenIndex((s) =>
                    s === null ? 0 : Math.min(images.length - 1, s + 1),
                  )
                }
                disabled={openIndex === images.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
