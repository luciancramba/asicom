import { describe, it, expect } from "vitest";
import { validateCnp } from "./cnp";

describe("validateCnp", () => {
  it("accepts a valid male 1990 CNP and decodes it", () => {
    const r = validateCnp("1900515012341");
    expect(r.valid).toBe(true);
    expect(r.sex).toBe("M");
    expect(r.birthDate).toBe("1990-05-15");
    expect(r.countyCode).toBe("01");
    expect(r.reason).toMatch(/OK/i);
  });

  it("accepts a valid female 2000s CNP and decodes century from the first digit", () => {
    const r = validateCnp("6051123120451");
    expect(r.valid).toBe(true);
    expect(r.sex).toBe("F");
    expect(r.birthDate).toBe("2005-11-23");
  });

  it("rejects a CNP whose control digit is wrong", () => {
    const r = validateCnp("1900515012342");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/control digit/i);
  });

  it("rejects input that is not 13 digits", () => {
    expect(validateCnp("123").valid).toBe(false);
    expect(validateCnp("abcdefghijklm").valid).toBe(false);
    expect(validateCnp("19005150123410").reason).toMatch(/13 digits/i);
  });

  it("does not emit a birthDate for an impossible calendar date", () => {
    // month 13 — must not produce a date
    expect(validateCnp("1991352012345").birthDate).toBeUndefined();
  });

  it("tolerates surrounding whitespace", () => {
    expect(validateCnp("  1900515012341  ").valid).toBe(true);
  });
});
