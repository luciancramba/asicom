import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { collectDocs, validateCnp, type ExtractionResult } from "@asicom/shared";
import { getDb, schema } from "./db";

type Db = ReturnType<typeof getDb>;

/**
 * Auto-create / match the client and their vehicle for a dosar from its extractions, keyed by CNP.
 *
 * Only a CNP that passes its control digit becomes a client key — "matched by CNP" must mean a
 * *verified* CNP, never a guessed one (the same trust rule as the fišă's green badge). Idempotent:
 * re-processing a dosar updates the existing client in place and never duplicates the vehicle.
 * Broker-entered contact fields (telefon/email) are filled from documents only if still empty —
 * they are never clobbered, because documents don't carry them.
 */
export function syncClientFromExtractions(
  db: Db,
  dosarId: string,
  extractions: ExtractionResult[],
): void {
  const { buletin, talon } = collectDocs(extractions);
  const cnp = buletin?.cnp?.trim();
  if (!cnp || !validateCnp(cnp).valid) return; // no trustworthy key → leave the dosar unlinked

  const now = new Date().toISOString();
  const adresaJson = buletin?.adresa ? JSON.stringify(buletin.adresa) : null;
  const actJson = JSON.stringify({
    serie: buletin?.serie ?? null,
    numar: buletin?.numar ?? null,
    valabilitate: buletin?.valabilitate ?? null,
  });

  const existing = db.select().from(schema.clients).where(eq(schema.clients.cnp, cnp)).get();
  let clientId: string;
  if (existing) {
    clientId = existing.id;
    db.update(schema.clients)
      .set({
        nume: buletin?.nume ?? existing.nume,
        prenume: buletin?.prenume ?? existing.prenume,
        sex: buletin?.sex ?? existing.sex,
        dataNasterii: buletin?.dataNasterii ?? existing.dataNasterii,
        adresaJson: adresaJson ?? existing.adresaJson,
        actJson,
        updatedAt: now,
      })
      .where(eq(schema.clients.id, clientId))
      .run();
  } else {
    clientId = randomUUID();
    db.insert(schema.clients)
      .values({
        id: clientId,
        cnp,
        nume: buletin?.nume ?? null,
        prenume: buletin?.prenume ?? null,
        sex: buletin?.sex ?? null,
        dataNasterii: buletin?.dataNasterii ?? null,
        adresaJson,
        actJson,
      })
      .run();
  }

  db.update(schema.dosare).set({ clientId }).where(eq(schema.dosare.id, dosarId)).run();

  // Vehicle: dedupe by VIN (preferred) or plate within the client.
  const vin = talon?.vin?.trim();
  const plate = talon?.numarInmatriculare?.trim();
  if (vin || plate) {
    const owned = db.select().from(schema.vehicles).where(eq(schema.vehicles.clientId, clientId)).all();
    const match = owned.find((v) => (vin && v.vin === vin) || (plate && v.plate === plate));
    if (!match) {
      db.insert(schema.vehicles)
        .values({
          id: randomUUID(),
          clientId,
          plate: plate ?? null,
          vin: vin ?? null,
          marca: talon?.marca ?? null,
          model: talon?.model ?? null,
          anFabricatie: talon?.anFabricatie ?? null,
          dataJson: JSON.stringify({
            cilindree: talon?.cilindree ?? null,
            putereKw: talon?.putereKw ?? null,
            combustibil: talon?.combustibil ?? null,
            locuri: talon?.locuri ?? null,
            serieCiv: talon?.serieCiv ?? null,
            dataPrimaInmatriculare: talon?.dataPrimaInmatriculare ?? null,
          }),
        })
        .run();
    }
  }
}
