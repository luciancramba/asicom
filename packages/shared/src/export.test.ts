import { describe, it, expect } from "vitest";
import { exportCsv, exportCsvFlat, exportTsv, exportPlain, exportJson } from "./export";
import type { FieldResult } from "./fisa";
import { verified, unverified } from "./confidence";

const FIELDS: FieldResult[] = [
  {
    id: "client.cnp",
    label: "CNP",
    group: "client",
    source: "buletin",
    value: "1711016011090",
    confidence: verified("CNP corect"),
  },
  {
    id: "client.nume",
    label: "Nume",
    group: "client",
    source: "buletin",
    value: "TRIPON",
    confidence: verified("Se potrivește cu permisul"),
  },
  {
    // Field whose value contains a comma — must round-trip safely in CSV.
    id: "client.adresa",
    label: "Adresă",
    group: "client",
    source: "buletin",
    value: "AB, Mun. Alba Iulia, Str. Barbu Lăutaru, 23",
    confidence: unverified("Extras, neverificat"),
  },
  {
    id: "client.telefon",
    label: "Telefon",
    group: "client",
    source: "manual",
    value: null,
    confidence: unverified("De completat manual"),
  },
];

describe("CSV export", () => {
  it("emits header + one row per field, CRLF lines, RFC4180-quoted commas", () => {
    const out = exportCsv(FIELDS);
    const lines = out.split("\r\n");
    expect(lines[0]).toBe("id,label,group,value,confidence");
    expect(lines).toHaveLength(5); // header + 4 fields
    // The adresa row must wrap the value in quotes because of the embedded commas.
    expect(lines[3]).toBe(
      'client.adresa,Adresă,client,"AB, Mun. Alba Iulia, Str. Barbu Lăutaru, 23",unverified',
    );
    // Missing values export as empty string, not "null"
    expect(lines[4]).toBe("client.telefon,Telefon,client,,unverified");
  });

  it("doubles embedded quotes inside a quoted cell", () => {
    const out = exportCsv([
      {
        id: "x",
        label: 'with "quotes"',
        group: "client",
        source: "manual",
        value: 'val "with" inner',
        confidence: unverified("x"),
      },
    ]);
    const lines = out.split("\r\n");
    expect(lines[1]).toBe('x,"with ""quotes""",client,"val ""with"" inner",unverified');
  });
});

describe("flat CSV (single row, one column per field id)", () => {
  it("emits header line of ids and value line in registry order", () => {
    const out = exportCsvFlat(FIELDS);
    const [header, values] = out.split("\r\n");
    expect(header).toBe("client.cnp,client.nume,client.adresa,client.telefon");
    expect(values).toBe(
      '1711016011090,TRIPON,"AB, Mun. Alba Iulia, Str. Barbu Lăutaru, 23",',
    );
  });
});

describe("TSV export (paste into spreadsheet cell)", () => {
  it("joins values with tabs, no header, replaces newlines and tabs in values", () => {
    const out = exportTsv([
      ...FIELDS.slice(0, 2),
      {
        id: "x",
        label: "messy",
        group: "client",
        source: "manual",
        value: "line1\nline2\tcol",
        confidence: unverified("x"),
      },
    ]);
    expect(out).toBe("1711016011090\tTRIPON\tline1 line2 col");
  });
});

describe("Plain key:value export (for email / chat)", () => {
  it("emits label:value lines, drops empty fields, no extra noise", () => {
    const out = exportPlain(FIELDS);
    const lines = out.split("\n");
    expect(lines).toHaveLength(3); // telefon is dropped because value is null
    expect(lines[0]).toBe("CNP: 1711016011090");
    expect(lines[1]).toBe("Nume: TRIPON");
    expect(lines[2]).toBe("Adresă: AB, Mun. Alba Iulia, Str. Barbu Lăutaru, 23");
  });
});

describe("JSON export", () => {
  it("emits an object keyed by field id with id/label/group/value/confidence", () => {
    const out = JSON.parse(exportJson(FIELDS));
    expect(Object.keys(out)).toEqual([
      "client.cnp",
      "client.nume",
      "client.adresa",
      "client.telefon",
    ]);
    expect(out["client.cnp"]).toEqual({
      id: "client.cnp",
      label: "CNP",
      group: "client",
      value: "1711016011090",
      confidence: "verified",
    });
    expect(out["client.telefon"].value).toBe("");
  });
});
