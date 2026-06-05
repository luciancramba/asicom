import { describe, it, expect } from "vitest";
import { buildFisa, type FieldResult } from "./fisa";
import type { ExtractionResult } from "./schemas";

const find = (results: FieldResult[], id: string): FieldResult =>
  results.find((r) => r.id === id)!;

describe("buildFisa", () => {
  it("verifies CNP and cross-checks sex + birthdate against the CNP", () => {
    const ex: ExtractionResult[] = [
      {
        docType: "buletin",
        buletin: { cnp: "1900515012341", sex: "M", dataNasterii: "1990-05-15", nume: "POPESCU" },
      },
    ];
    const f = buildFisa(ex);
    expect(find(f, "client.cnp").confidence.state).toBe("verified");
    expect(find(f, "client.sex").confidence.state).toBe("verified");
    expect(find(f, "client.dataNasterii").confidence.state).toBe("verified");
  });

  it("fails sex and birthdate when they contradict the CNP", () => {
    const ex: ExtractionResult[] = [
      { docType: "buletin", buletin: { cnp: "1900515012341", sex: "F", dataNasterii: "1991-01-01" } },
    ];
    const f = buildFisa(ex);
    expect(find(f, "client.sex").confidence.state).toBe("failed");
    expect(find(f, "client.dataNasterii").confidence.state).toBe("failed");
  });

  it("fails an invalid CNP", () => {
    const ex: ExtractionResult[] = [{ docType: "buletin", buletin: { cnp: "1900515012342" } }];
    expect(find(buildFisa(ex), "client.cnp").confidence.state).toBe("failed");
  });

  it("cross-checks the name against the permis", () => {
    const match: ExtractionResult[] = [
      { docType: "buletin", buletin: { nume: "Ionescu" } },
      { docType: "permis", permis: { nume: "IONESCU" } },
    ];
    expect(find(buildFisa(match), "client.nume").confidence.state).toBe("verified");

    const mismatch: ExtractionResult[] = [
      { docType: "buletin", buletin: { nume: "Ionescu" } },
      { docType: "permis", permis: { nume: "Popescu" } },
    ];
    expect(find(buildFisa(mismatch), "client.nume").confidence.state).toBe("failed");
  });

  it("checks VIN format (weak) and act expiry (must be future)", () => {
    const ex: ExtractionResult[] = [
      { docType: "talon", talon: { vin: "WVWZZZ1KZAW482910" } },
      { docType: "buletin", buletin: { valabilitate: "2020-01-01" } },
    ];
    const f = buildFisa(ex);
    expect(find(f, "vehicul.vin").confidence.state).toBe("unverified");
    expect(find(f, "client.actExpirare").confidence.state).toBe("failed");
  });

  it("marks missing fields as unverified, never failed", () => {
    const f = buildFisa([{ docType: "buletin", buletin: {} }]);
    expect(find(f, "client.cnp").confidence.state).toBe("unverified");
    expect(find(f, "client.telefon").confidence.state).toBe("unverified");
  });
});
