import type { FieldResult } from "./fisa";

/**
 * Output adapter (PR7, pre-spike phase): turn the verified fišă into formats Tripon can drop
 * straight into ANY backoffice — Insuretech, Excel, a CRM, etc. The exact CSV column names for
 * Insuretech itself are pending the screen-share spike; until then we ship a sensible default
 * keyed by our FIELD_REGISTRY id, which works for any consumer who can map to it.
 */

export interface ExportRow {
  /** stable id (e.g. "client.cnp") — used by the eventual Insuretech adapter as the column key. */
  id: string;
  /** Romanian label, ready for human-facing exports. */
  label: string;
  /** group: client / vehicul / valabilitate */
  group: string;
  /** value or null. Empty manual fields export as "" rather than the literal "null". */
  value: string;
  /** "verified" | "unverified" | "failed" — useful for the consumer to flag rows that need review. */
  confidence: string;
}

function toRow(f: FieldResult): ExportRow {
  return {
    id: f.id,
    label: f.label,
    group: f.group,
    value: f.value ?? "",
    confidence: f.confidence.state,
  };
}

/** Quote a CSV value per RFC 4180: only escape if it contains delimiter, quote, or newline. */
function csvCell(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Quote a TSV value (tab-separated). Newlines become spaces because spreadsheets handle tabs strictly. */
function tsvCell(s: string): string {
  return s.replace(/[\t\r\n]+/g, " ").trim();
}

/**
 * Comma-separated values, one row per field. Columns: id, label, group, value, confidence.
 * Header included. Works for Excel, Google Sheets, any DB import.
 */
export function exportCsv(fields: FieldResult[]): string {
  const rows = fields.map(toRow);
  const header = ["id", "label", "group", "value", "confidence"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [r.id, r.label, r.group, r.value, r.confidence].map(csvCell).join(","),
    );
  }
  // CRLF so it opens cleanly in Excel without extra config.
  return lines.join("\r\n");
}

/**
 * Single-row CSV with one column per field (id as the column name). The format Insuretech is
 * MOST LIKELY to expect for bulk import — confirm exact column names during the screen-share
 * spike and tweak FIELD_REGISTRY.insuretechKey to map to them.
 */
export function exportCsvFlat(fields: FieldResult[]): string {
  const rows = fields.map(toRow);
  const header = rows.map((r) => csvCell(r.id)).join(",");
  const values = rows.map((r) => csvCell(r.value)).join(",");
  return [header, values].join("\r\n");
}

/**
 * Tab-separated values for direct paste into a spreadsheet cell. One row, fields in registry
 * order — broker can paste into Insuretech if it accepts tab-delimited input.
 */
export function exportTsv(fields: FieldResult[]): string {
  const values = fields.map((f) => tsvCell(f.value ?? ""));
  return values.join("\t");
}

/**
 * Newline-separated key:value list. Useful when the broker wants to email or message the data
 * to someone manually, or paste into a free-form notes field.
 */
export function exportPlain(fields: FieldResult[]): string {
  return fields
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");
}

/** Structured JSON keyed by field id — for any future API integration. Stable contract. */
export function exportJson(fields: FieldResult[]): string {
  const obj: Record<string, ExportRow> = {};
  for (const f of fields) obj[f.id] = toRow(f);
  return JSON.stringify(obj, null, 2);
}
