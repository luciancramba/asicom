// Dev-only: seed a processed demo dosar (valid buletin + talon + permis, one deliberate mismatch)
// so the fišă can be eyeballed without an ANTHROPIC_API_KEY. Run from apps/web:
//   node scripts/seed-demo.mjs
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve, dirname } from "node:path";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/asicom.db";
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./data/uploads";

mkdirSync(dirname(DB_PATH), { recursive: true });
const sqlite = new Database(DB_PATH);
sqlite.pragma("foreign_keys = ON");
// Apply migrations via drizzle so the journal is correct (the app re-runs migrate idempotently).
migrate(drizzle(sqlite), { migrationsFolder: "./drizzle" });

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const dosarId = randomUUID();
const now = new Date().toISOString();
sqlite
  .prepare("INSERT INTO dosare (id,status,created_at,processed_at) VALUES (?,?,?,?)")
  .run(dosarId, "de_verificat", now, now);

function addPhoto(docType, result) {
  const photoId = randomUUID();
  const dir = resolve(UPLOAD_DIR, dosarId);
  mkdirSync(dir, { recursive: true });
  const fp = resolve(dir, `${photoId}.png`);
  writeFileSync(fp, png);
  sqlite
    .prepare("INSERT INTO photos (id,dosar_id,filepath,doc_type,uploaded_at) VALUES (?,?,?,?,?)")
    .run(photoId, dosarId, fp, docType, now);
  sqlite
    .prepare(
      "INSERT INTO extractions (id,dosar_id,photo_id,doc_type,fields_json,model_used,created_at) VALUES (?,?,?,?,?,?,?)",
    )
    .run(randomUUID(), dosarId, photoId, docType, JSON.stringify(result), "seed", now);
}

// dataNasterii deliberately disagrees with the CNP (1990-05-15) → a red "Eroare" badge.
addPhoto("buletin", {
  docType: "buletin",
  buletin: {
    cnp: "1900515012341",
    nume: "POPESCU",
    prenume: "ION",
    sex: "M",
    dataNasterii: "1991-01-01",
    cetatenie: "Română",
    serie: "AB",
    numar: "123456",
    valabilitate: "2030-01-01",
    adresa: { judet: "Alba", localitate: "Alba Iulia", strada: "Str. Exemplu", numar: "10" },
  },
});
addPhoto("talon", {
  docType: "talon",
  talon: {
    numarInmatriculare: "AB 12 XYZ",
    vin: "WVWZZZ1KZAW482910",
    marca: "Dacia",
    model: "Logan",
    anFabricatie: "2018",
    combustibil: "Benzină",
    cilindree: "1598",
    locuri: "5",
  },
});
addPhoto("permis", { docType: "permis", permis: { nume: "POPESCU", prenume: "ION" } });

console.log("SEED_DOSAR_ID=" + dosarId);
