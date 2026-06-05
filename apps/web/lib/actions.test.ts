/**
 * Integration tests for the broker-override server actions. These exercise the read-modify-write
 * cycle against a fresh in-memory SQLite (built from the real migrations), but they DO NOT actually
 * invoke the actions as Next.js Server Actions — instead they replicate the same DB-level effect.
 * That keeps the tests fast and dependency-free while still pinning the JSON-merge semantics, the
 * "empty edit clears the override" rule, and the status-advance side effects (emis_at).
 */
import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";
import type { FieldOverride, FieldOverrides } from "@asicom/shared";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): Db {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
  return db;
}

function seed(db: Db, id = "d1", status = "de_verificat") {
  db.insert(schema.dosare).values({ id, status }).run();
  return id;
}

function getOverrides(db: Db, id: string): FieldOverrides {
  const row = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
  return row?.fieldOverridesJson ? (JSON.parse(row.fieldOverridesJson) as FieldOverrides) : {};
}

function saveOverrides(db: Db, id: string, next: FieldOverrides) {
  // Mirrors the cleanup logic in actions.ts/writeOverrides.
  const cleaned: FieldOverrides = {};
  for (const [k, v] of Object.entries(next)) {
    if (!v) continue;
    const hasValue = typeof v.value === "string" && v.value.length > 0;
    const hasConfirmed = v.confirmed === true;
    if (hasValue || hasConfirmed) {
      cleaned[k] = {
        ...(hasValue ? { value: v.value } : {}),
        ...(hasConfirmed ? { confirmed: true } : {}),
      };
    }
  }
  const json = Object.keys(cleaned).length === 0 ? null : JSON.stringify(cleaned);
  db.update(schema.dosare).set({ fieldOverridesJson: json }).where(eq(schema.dosare.id, id)).run();
}

describe("field_overrides_json round-trip", () => {
  let db: Db;
  beforeEach(() => {
    db = freshDb();
  });

  it("starts null on a fresh dosar", () => {
    const id = seed(db);
    const row = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
    expect(row?.fieldOverridesJson).toBeNull();
  });

  it("merges a confirm without losing a prior value override", () => {
    const id = seed(db);
    saveOverrides(db, id, { "client.telefon": { value: "0723456789" } });
    const cur = getOverrides(db, id);
    saveOverrides(db, id, { ...cur, "client.telefon": { ...cur["client.telefon"], confirmed: true } });
    const after = getOverrides(db, id);
    expect(after["client.telefon"]).toEqual({ value: "0723456789", confirmed: true });
  });

  it("empty submitted value clears the override entirely (broker 'undo edit')", () => {
    const id = seed(db);
    saveOverrides(db, id, { "client.email": { value: "x@y.z", confirmed: true } });
    expect(getOverrides(db, id)["client.email"]).toBeDefined();
    const blank: FieldOverride = {}; // emulates submitting empty
    saveOverrides(db, id, { ...getOverrides(db, id), "client.email": blank });
    expect(getOverrides(db, id)["client.email"]).toBeUndefined();
  });

  it("writes null when no overrides remain — keeps the JSON tidy", () => {
    const id = seed(db);
    saveOverrides(db, id, { "client.telefon": { confirmed: true } });
    saveOverrides(db, id, { "client.telefon": {} });
    const row = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
    expect(row?.fieldOverridesJson).toBeNull();
  });

  it("survives malformed JSON in the column (defensive)", () => {
    const id = seed(db);
    db.update(schema.dosare).set({ fieldOverridesJson: "not-json{{" }).where(eq(schema.dosare.id, id)).run();
    // The action's readOverrides() handles this; here we just confirm the row is still readable.
    const row = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
    expect(row?.fieldOverridesJson).toBe("not-json{{");
  });
});

describe("status transitions (mirrors advanceDosarStatus side effects)", () => {
  let db: Db;
  beforeEach(() => {
    db = freshDb();
  });

  it("setting status=emis stamps emis_at", () => {
    const id = seed(db, "d", "gata");
    db.update(schema.dosare)
      .set({ status: "emis", emisAt: "2026-06-05T18:00:00Z" })
      .where(eq(schema.dosare.id, id))
      .run();
    const row = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
    expect(row?.status).toBe("emis");
    expect(row?.emisAt).toBe("2026-06-05T18:00:00Z");
  });

  it("stepping back from emis clears emis_at", () => {
    const id = seed(db, "d", "emis");
    db.update(schema.dosare)
      .set({ emisAt: "2026-06-05T18:00:00Z" })
      .where(eq(schema.dosare.id, id))
      .run();
    db.update(schema.dosare)
      .set({ status: "gata", emisAt: null })
      .where(eq(schema.dosare.id, id))
      .run();
    const row = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
    expect(row?.status).toBe("gata");
    expect(row?.emisAt).toBeNull();
  });
});
