"use client";

import { useEffect, useState } from "react";

interface Props {
  src: string;
  alt: string;
  /** Optional caption shown on the lightbox (e.g. the doc-type label). */
  caption?: string;
}

/**
 * A clickable image that renders inline at the size the container gives it, and opens to a
 * full-screen lightbox on click — with the original-resolution image scaled to fit the viewport
 * (object-contain) and pinch / wheel zoom via the browser's native handling. This is the source
 * document the broker eyeballs to verify the extracted fields; if it isn't readable, the whole
 * trust model breaks.
 *
 * Escape closes the lightbox. Click on the dimmed backdrop also closes. The image itself swallows
 * the click so accidental closes don't happen while zooming.
 */
export function ImageViewer({ src, alt, caption }: Props) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock background scroll
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Mărește ${alt}`}
        className="group relative block w-full overflow-hidden rounded-lg border border-line bg-cloud transition-shadow hover:shadow-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full object-cover" />
        <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          🔍 Mărește
        </span>
      </button>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {caption ? (
              <span className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                {caption}
              </span>
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label="Închide"
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              ✕ Închide (Esc)
            </button>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
            className={`max-h-[92vh] cursor-zoom-in select-none rounded-md object-contain transition-transform ${
              zoomed ? "max-h-none max-w-none cursor-zoom-out scale-[2]" : "max-w-[92vw]"
            }`}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-white/10 px-3 py-1 text-xs text-white/80">
            Apasă pe imagine pentru zoom · click în fundal sau Esc pentru închidere
          </div>
        </div>
      ) : null}
    </>
  );
}
