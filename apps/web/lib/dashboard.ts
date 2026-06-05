import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "./db";

const STATUS_KEYS = ["primit", "in_procesare", "de_verificat", "gata", "emis"] as const;
const MINUTES_SAVED_PER_DOSAR = 13; // ~15 min of retyping → ~2 min of review

function fullName(nume: string | null, prenume: string | null): string | null {
  const n = [nume, prenume].filter(Boolean).join(" ").trim();
  return n || null;
}

function parseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

// ---------- Dashboard: dosare list + KPIs ----------

export interface DosarRow {
  id: string;
  status: string;
  createdAt: string;
  clientId: string | null;
  clientName: string | null;
  cnp: string | null;
  plates: string[];
}

/** All dosare (newest first), each with its linked client + plates. Optional free-text filter. */
export function getDosare(q?: string): DosarRow[] {
  const db = getDb();
  const rows = db
    .select({
      id: schema.dosare.id,
      status: schema.dosare.status,
      createdAt: schema.dosare.createdAt,
      clientId: schema.dosare.clientId,
      nume: schema.clients.nume,
      prenume: schema.clients.prenume,
      cnp: schema.clients.cnp,
    })
    .from(schema.dosare)
    .leftJoin(schema.clients, eq(schema.dosare.clientId, schema.clients.id))
    .orderBy(desc(schema.dosare.createdAt))
    .all();

  const platesByClient = new Map<string, string[]>();
  for (const v of db
    .select({ clientId: schema.vehicles.clientId, plate: schema.vehicles.plate })
    .from(schema.vehicles)
    .all()) {
    if (!v.clientId || !v.plate) continue;
    platesByClient.set(v.clientId, [...(platesByClient.get(v.clientId) ?? []), v.plate]);
  }

  let list: DosarRow[] = rows.map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.createdAt,
    clientId: r.clientId,
    clientName: fullName(r.nume, r.prenume),
    cnp: r.cnp,
    plates: r.clientId ? (platesByClient.get(r.clientId) ?? []) : [],
  }));

  const needle = q?.trim().toLowerCase();
  if (needle) {
    list = list.filter(
      (r) =>
        r.clientName?.toLowerCase().includes(needle) ||
        r.cnp?.includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        r.plates.some((p) => p.toLowerCase().includes(needle)),
    );
  }
  return list;
}

export interface Kpis {
  total: number;
  byStatus: Record<string, number>;
  deVerificat: number;
  emis: number;
  minutesSaved: number;
}

export function getKpis(): Kpis {
  const db = getDb();
  const rows = db.select({ status: schema.dosare.status }).from(schema.dosare).all();
  const byStatus: Record<string, number> = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0]));
  for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  const processed = byStatus.de_verificat + byStatus.gata + byStatus.emis;
  return {
    total: rows.length,
    byStatus,
    deVerificat: byStatus.de_verificat,
    emis: byStatus.emis,
    minutesSaved: processed * MINUTES_SAVED_PER_DOSAR,
  };
}

// ---------- Client records ----------

export interface ClientListItem {
  id: string;
  name: string | null;
  cnp: string | null;
  vehicleCount: number;
  dosarCount: number;
}

export function getClients(): ClientListItem[] {
  const db = getDb();
  const clients = db.select().from(schema.clients).orderBy(desc(schema.clients.updatedAt)).all();
  const countBy = (rows: { clientId: string | null }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) if (r.clientId) m.set(r.clientId, (m.get(r.clientId) ?? 0) + 1);
    return m;
  };
  const vc = countBy(db.select({ clientId: schema.vehicles.clientId }).from(schema.vehicles).all());
  const dc = countBy(db.select({ clientId: schema.dosare.clientId }).from(schema.dosare).all());
  return clients.map((c) => ({
    id: c.id,
    name: fullName(c.nume, c.prenume),
    cnp: c.cnp,
    vehicleCount: vc.get(c.id) ?? 0,
    dosarCount: dc.get(c.id) ?? 0,
  }));
}

export interface ClientDetail {
  id: string;
  name: string | null;
  cnp: string | null;
  sex: string | null;
  dataNasterii: string | null;
  telefon: string | null;
  email: string | null;
  adresa: Record<string, string> | null;
  act: { serie?: string | null; numar?: string | null; valabilitate?: string | null } | null;
  vehicles: {
    id: string;
    plate: string | null;
    vin: string | null;
    marca: string | null;
    model: string | null;
    anFabricatie: string | null;
  }[];
  policies: {
    id: string;
    policyNumber: string | null;
    insurer: string | null;
    type: string | null;
    validFrom: string | null;
    validTo: string | null;
  }[];
  dosare: { id: string; status: string; createdAt: string }[];
}

export function getClient(id: string): ClientDetail | null {
  const db = getDb();
  const c = db.select().from(schema.clients).where(eq(schema.clients.id, id)).get();
  if (!c) return null;
  const vehicles = db.select().from(schema.vehicles).where(eq(schema.vehicles.clientId, id)).all();
  const policies = db.select().from(schema.policies).where(eq(schema.policies.clientId, id)).all();
  const dosare = db
    .select({ id: schema.dosare.id, status: schema.dosare.status, createdAt: schema.dosare.createdAt })
    .from(schema.dosare)
    .where(eq(schema.dosare.clientId, id))
    .orderBy(desc(schema.dosare.createdAt))
    .all();
  return {
    id: c.id,
    name: fullName(c.nume, c.prenume),
    cnp: c.cnp,
    sex: c.sex,
    dataNasterii: c.dataNasterii,
    telefon: c.telefon,
    email: c.email,
    adresa: parseJson(c.adresaJson),
    act: parseJson(c.actJson),
    vehicles: vehicles.map((v) => ({
      id: v.id,
      plate: v.plate,
      vin: v.vin,
      marca: v.marca,
      model: v.model,
      anFabricatie: v.anFabricatie,
    })),
    policies: policies.map((p) => ({
      id: p.id,
      policyNumber: p.policyNumber,
      insurer: p.insurer,
      type: p.type,
      validFrom: p.validFrom,
      validTo: p.validTo,
    })),
    dosare,
  };
}
