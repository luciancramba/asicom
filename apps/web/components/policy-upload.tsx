"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { attachPolicy } from "@/lib/actions";

const MAX_MB = 8;

function SubmitButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!ready || pending}
      className="rounded-lg bg-asicom px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-asicom-mid disabled:opacity-40"
    >
      {pending ? "Se analizează PDF-ul…" : "Atașează polița"}
    </button>
  );
}

/**
 * Drag-drop a policy PDF, server-action extracts metadata via Claude, broker confirms by then
 * clicking "Marchează emis" (in StatusAdvance). Errors are surfaced inline so a wrong file type
 * or a missing API key doesn't disappear silently.
 */
export function PolicyUpload({ dosarId }: { dosarId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFile(list: FileList | null) {
    setError(null);
    if (!list || list.length === 0) return;
    const f = list[0];
    if (f.type !== "application/pdf") {
      setError("Doar fișiere PDF sunt acceptate.");
      return;
    }
    const mb = f.size / 1024 / 1024;
    if (mb > MAX_MB) {
      setError(`PDF prea mare (${mb.toFixed(1)} MB). Maxim ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
    }
  }

  return (
    <form action={attachPolicy} className="flex flex-col gap-3">
      <input type="hidden" name="dosarId" value={dosarId} />

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-cloud px-6 py-8 text-center transition-colors hover:border-asicom-mid"
      >
        <span className="text-2xl">📄</span>
        <span className="text-sm font-medium text-ink">
          {file ? file.name : "Atașează polița (PDF)"}
        </span>
        <span className="text-xs text-ink/55">
          {file
            ? `${(file.size / 1024).toFixed(0)} KB · gata de procesare`
            : `Trage aici sau apasă · max ${MAX_MB} MB · doar PDF`}
        </span>
        <input
          ref={inputRef}
          name="policy"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files)}
        />
      </label>

      {error ? (
        <p className="rounded-md border border-fail/30 bg-fail/5 px-3 py-2 text-xs text-fail">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-ink/55">
        AI-ul citește numărul de poliță, asigurătorul, datele de valabilitate și placa. Le poți
        edita după dacă ceva e greșit.
      </p>

      <div className="flex items-center justify-end">
        <SubmitButton ready={Boolean(file)} />
      </div>
    </form>
  );
}
