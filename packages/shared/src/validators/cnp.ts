/**
 * Romanian CNP (Cod Numeric Personal) — the single most useful field in the whole pipeline.
 * It self-validates via a control digit, AND encodes sex + birthdate + county, which lets us
 * cross-check the extracted `sex` and `dataNasterii` with zero LLM trust.
 *
 * Layout: S YY MM DD JJ NNN C
 *   S   sex + century   YYMMDD birth date   JJ county   NNN sequence   C control digit
 */

const CONTROL_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

export interface CnpDecoded {
  /** control digit is correct */
  valid: boolean;
  sex?: "M" | "F";
  /** ISO yyyy-mm-dd, only when the encoded date is a real calendar date */
  birthDate?: string;
  /** county code (JJ), e.g. "01" */
  countyCode?: string;
  reason: string;
}

export function validateCnp(raw: string): CnpDecoded {
  const cnp = (raw ?? "").trim();
  if (!/^\d{13}$/.test(cnp)) {
    return { valid: false, reason: "CNP must be exactly 13 digits" };
  }

  const digits = cnp.split("").map((d) => Number(d));

  // Control digit: weighted sum mod 11, with 10 mapped to 1.
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * CONTROL_WEIGHTS[i];
  }
  let control = sum % 11;
  if (control === 10) control = 1;
  const valid = control === digits[12];

  // Sex + century from the first digit.
  let sex: "M" | "F" | undefined;
  let century: number | undefined;
  switch (digits[0]) {
    case 1: sex = "M"; century = 1900; break;
    case 2: sex = "F"; century = 1900; break;
    case 3: sex = "M"; century = 1800; break;
    case 4: sex = "F"; century = 1800; break;
    case 5: sex = "M"; century = 2000; break;
    case 6: sex = "F"; century = 2000; break;
    case 7: sex = "M"; break; // resident — century ambiguous, leave birthDate undecoded
    case 8: sex = "F"; break;
    default: break; // 9 / 0 — foreign person, no reliable decode
  }

  // Birth date — only emit it if it is a real calendar date.
  const yy = digits[1] * 10 + digits[2];
  const mm = digits[3] * 10 + digits[4];
  const dd = digits[5] * 10 + digits[6];
  let birthDate: string | undefined;
  if (century && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
    const year = century + yy;
    const iso = `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    const d = new Date(`${iso}T00:00:00Z`);
    if (!Number.isNaN(d.getTime()) && d.getUTCMonth() + 1 === mm && d.getUTCDate() === dd) {
      birthDate = iso;
    }
  }

  return {
    valid,
    sex,
    birthDate,
    countyCode: cnp.slice(7, 9),
    reason: valid ? "CNP control digit OK" : "CNP control digit mismatch",
  };
}
