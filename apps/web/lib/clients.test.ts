import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";
import type { ExtractionResult } from "@asicom/shared";
import * as schema from "./schema";
import { syncClientFromExtractions } from "./clients";

/** An isolated in-memory DB built from the real migrations — same setup as getDb(), no file. */
function freshDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
  return db;
}

function seedDosar(db: ReturnType<typeof freshDb>, id = "d1") {
  db.insert(schema.dosare).values({ id, status: "de_verificat" }).run();
  return id;
}

// Tripon's real dosar shape: valid CNP on the buletin, a vehicle on the talon.
const TRIPON: ExtractionResult[] = [
  {
    docType: "buletin",
    buletin: { cnp: "1711016011090", nume: "TRIPON", prenume: "LUCIAN-NICOLAE", sex: "M", dataNasterii: "1971-10-16" },
  },
  {
    docType: "talon",
    talon: { numarInmatriculare: "AB-17-VIP", vin: "WDD2452071J648520", marca: "MERCEDES-BENZ", model: "B 180 CDI" },
  },
];

describe("syncClientFromExtractions", () => {
  it("creates a client (by verified CNP) + vehicle and links the dosar", () => {
    const db = freshDb();
    const id = seedDosar(db);
    syncClientFromExtractions(db, id, TRIPON);

    const clients = db.select().from(schema.clients).all();
    expect(clients).toHaveLength(1);
    expect(clients[0].cnp).toBe("1711016011090");
    expect(clients[0].nume).toBe("TRIPON");

    const dosar = db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get();
    expect(dosar?.clientId).toBe(clients[0].id);

    const vehicles = db.select().from(schema.vehicles).all();
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].vin).toBe("WDD2452071J648520");
    expect(vehicles[0].clientId).toBe(clients[0].id);
  });

  it("is idempotent: re-processing the same dosar duplicates nothing", () => {
    const db = freshDb();
    const id = seedDosar(db);
    syncClientFromExtractions(db, id, TRIPON);
    syncClientFromExtractions(db, id, TRIPON);
    expect(db.select().from(schema.clients).all()).toHaveLength(1);
    expect(db.select().from(schema.vehicles).all()).toHaveLength(1);
  });

  it("matches an existing client by CNP across two dosare", () => {
    const db = freshDb();
    const a = seedDosar(db, "a");
    const b = seedDosar(db, "b");
    syncClientFromExtractions(db, a, TRIPON);
    syncClientFromExtractions(db, b, TRIPON);

    const clients = db.select().from(schema.clients).all();
    expect(clients).toHaveLength(1);
    expect(db.select().from(schema.dosare).where(eq(schema.dosare.clientId, clients[0].id)).all()).toHaveLength(2);
  });

  it("skips client creation when the CNP fails its control digit", () => {
    const db = freshDb();
    const id = seedDosar(db);
    syncClientFromExtractions(db, id, [{ docType: "buletin", buletin: { cnp: "1711016011099", nume: "X" } }]);
    expect(db.select().from(schema.clients).all()).toHaveLength(0);
    expect(db.select().from(schema.dosare).where(eq(schema.dosare.id, id)).get()?.clientId).toBeNull();
  });
});
