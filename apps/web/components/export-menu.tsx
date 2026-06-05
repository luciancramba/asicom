"use client";

import { useEffect, useRef, useState } from "react";
import {
  exportCsv,
  exportCsvFlat,
  exportTsv,
  exportPlain,
  exportJson,
  type FieldResult,
} from "@asicom/shared";

interface Props {
  fields: FieldResult[];
  /** Short identifier used in the downloaded filename, e.g. the dosar id slice. */
  filenameBase: string;
}

type FormatKey = "csv" | "flat" | "tsv" | "plain" | "json";

const FORMATS: { key: FormatKey; label: string; hint: string; ext: string; mime: string }[] = [
  {
    key: "csv",
    label: "CSV (Excel / Sheets)",
    hint: "Antet + un rând per câmp · UTF-8 · RFC 4180",
    ext: "csv",
    mime: "text/csv",
  },
  {
    key: "flat",
    label: "CSV Insuretech-ready",
    hint: "Un singur rând · coloane = id câmp · pregătit pentru import bulk",
    ext: "csv",
    mime: "text/csv",
  },
  {
    key: "tsv",
    label: "TSV (lipește în Excel)",
    hint: "Valori separate prin tab · lipește direct într-o celulă",
    ext: "tsv",
    mime: "text/tab-separated-values",
  },
  {
    key: "plain",
    label: "Text simplu (email / chat)",
    hint: "Etichetă: valoare · gata de copiat în mesaj",
    ext: "txt",
    mime: "text/plain",
  },
  {
    key: "json",
    label: "JSON (integrări viitoare)",
    hint: "Obiect cheie-valoare · contract stabil pentru API",
    ext: "json",
    mime: "application/json",
  },
];

function generate(key: FormatKey, fields: FieldResult[]): string {
  switch (key) {
    case "csv":
      return exportCsv(fields);
    case "flat":
      return exportCsvFlat(fields);
    case "tsv":
      return exportTsv(fields);
    case "plain":
      return exportPlain(fields);
    case "json":
      return exportJson(fields);
  }
}

function download(content: string, mime: string, filename: string) {
  // CSV / Sheets opens cleanest with a UTF-8 BOM on Windows.
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Dropdown menu for exporting the fišă into 5 formats. Each format has a Copy and a Download
 * action — the broker picks the one that matches their next destination (Insuretech, Excel,
 * Outlook, WhatsApp, an internal API).
 */
export function ExportMenu({ fields, filenameBase }: Props) {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function flashMsg(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash((m) => (m === msg ? null : m)), 1600);
  }

  async function onCopy(key: FormatKey) {
    const ok = await copyToClipboard(generate(key, fields));
    flashMsg(ok ? "✓ Copiat în clipboard" : "✗ Copierea a eșuat");
    setOpen(false);
  }

  function onDownload(key: FormatKey, ext: string, mime: string) {
    const text = generate(key, fields);
    const name = `asicom-fisa-${filenameBase}-${key}.${ext}`;
    download(text, mime, name);
    flashMsg(`↓ Descărcat ${name}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-asicom transition-colors hover:bg-cloud"
      >
        ↓ Exportă fișa
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          <div className="border-b border-line bg-cloud px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-asicom">
            Formate
          </div>
          <ul className="divide-y divide-line">
            {FORMATS.map((f) => (
              <li key={f.key} className="px-3 py-2.5">
                <div className="text-sm font-medium text-ink">{f.label}</div>
                <p className="mt-0.5 text-xs text-ink/55">{f.hint}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onCopy(f.key)}
                    className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-asicom hover:bg-cloud"
                  >
                    Copiază
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload(f.key, f.ext, f.mime)}
                    className="rounded-md bg-asicom px-2.5 py-1 text-xs font-medium text-white hover:bg-asicom-mid"
                  >
                    Descarcă .{f.ext}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {flash ? (
        <div className="absolute right-0 z-40 mt-1 rounded-md border border-ok/30 bg-ok/5 px-2.5 py-1 text-xs text-ok">
          {flash}
        </div>
      ) : null}
    </div>
  );
}
