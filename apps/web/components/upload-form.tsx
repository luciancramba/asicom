"use client";

import { useRef, useState } from "react";
import { createDosar } from "@/lib/actions";

const MAX = 5;

export function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);

  function syncInput(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    const next = [...files, ...incoming].slice(0, MAX);
    setFiles(next);
    syncInput(next);
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
          addFiles(e.dataTransfer.files);
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
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="relative overflow-hidden rounded-lg border border-line">
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
      )}

      <button
        type="submit"
        disabled={files.length === 0 || pending}
        className="self-start rounded-lg bg-asicom px-5 py-2.5 font-semibold text-white transition-colors hover:bg-asicom-mid disabled:opacity-40"
      >
        {pending ? "Se încarcă…" : `Creează dosar${files.length ? ` (${files.length})` : ""}`}
      </button>
    </form>
  );
}
