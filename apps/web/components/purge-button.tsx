"use client";

import { useState, useTransition } from "react";
import { runPurge } from "@/lib/actions";

/**
 * Admin trigger for the GDPR purge sweep. Runs the same logic the future cron would (delete
 * photos + policy PDFs older than RETENTION_DAYS post-emis), reports the result inline so the
 * broker sees what happened. Confirms before running because it's destructive on the filesystem.
 */
export function PurgeButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    photosRemoved: number;
    policiesRemoved: number;
    retentionDays: number;
  } | null>(null);

  function onClick() {
    if (
      !confirm(
        "Ștergi pozele și PDF-urile pentru toate dosarele emise mai vechi de 14 zile?\n\n" +
          "Datele structurate (clienți, vehicule, registru polițe) rămân — doar fișierele de pe disc.",
      )
    ) {
      return;
    }
    setResult(null);
    startTransition(async () => {
      const r = await runPurge();
      setResult({
        photosRemoved: r.photosRemoved,
        policiesRemoved: r.policiesRemoved,
        retentionDays: r.retentionDays,
      });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-cloud disabled:opacity-50"
        title="GDPR: șterge fișierele pentru dosare emise > 14 zile"
      >
        {pending ? "Se curăță…" : "🧹 Curăță fișiere expirate (GDPR)"}
      </button>
      {result ? (
        <span className="rounded-md border border-ok/30 bg-ok/5 px-2.5 py-1 text-xs text-ok">
          ✓ Șterse: {result.photosRemoved} poze + {result.policiesRemoved} PDF-uri
          (retenție {result.retentionDays} zile post-Emis)
        </span>
      ) : null}
    </div>
  );
}
