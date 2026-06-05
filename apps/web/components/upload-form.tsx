"use client";

import { useRef, useState } from "react";
import { createDosar } from "@/lib/actions";

const MAX = 5;
const MAX_EDGE = 1600; // plenty for document OCR; the vision model doesn't need full resolution
const JPEG_QUALITY = 0.85;

/**
 * Downscale a photo to ≤ MAX_EDGE on the long side and re-encode as JPEG, with EXIF orientation
 * applied. Falls back to the original file if the browser can't decode it (e.g. HEIC straight
 * from the camera roll — WhatsApp-shared photos are already JPEG) or if resizing wouldn't help.
 */
async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_EDGE / longEdge);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file; // no win — keep the original
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

const totalKb = (files: File[]): number =>
  Math.round(files.reduce((sum, f) => sum + f.size, 0) / 1024);

export function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  function syncInput(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;
    setOptimizing(true);
    try {
      const resized = await Promise.all(incoming.map(downscaleImage));
      const next = [...files, ...resized].slice(0, MAX);
      setFiles(next);
      syncInput(next);
    } finally {
      setOptimizing(false);
    }
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    syncInput(next);
  }

  return (
    <form action={createDosar} onSubmit={() => setPending(true)} className="flex flex-col gap-4">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void addFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-cloud px-6 py-12 text-center transition-colors hover:border-asicom-mid"
      >
        <span className="font-medium text-ink">Adaugă poze</span>
        <span className="text-sm text-ink/50">
          Buletin, talon, permis — atinge sau trage aici (max {MAX})
        </span>
        <input
          ref={inputRef}
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="relative overflow-hidden rounded-lg border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Elimină"
                  className="absolute right-1 top-1 rounded-full bg-ink/70 px-1.5 text-xs leading-5 text-white"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink/40">
            {files.length} {files.length === 1 ? "poză" : "poze"} · {totalKb(files)} KB după optimizare
          </p>
        </>
      )}

      <button
        type="submit"
        disabled={files.length === 0 || pending || optimizing}
        className="self-start rounded-lg bg-asicom px-5 py-2.5 font-semibold text-white transition-colors hover:bg-asicom-mid disabled:opacity-40"
      >
        {optimizing
          ? "Se optimizează…"
          : pending
            ? "Se încarcă…"
            : `Creează dosar${files.length ? ` (${files.length})` : ""}`}
      </button>
    </form>
  );
}
