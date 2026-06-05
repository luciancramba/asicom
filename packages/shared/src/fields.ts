/**
 * The canonical field registry — the spine of the whole product.
 *
 * Fields are listed in the exact order of the Insuretech emission form (§2 of the brief),
 * so the fišă renders top-to-bottom in the order the broker fills them. The SAME registry
 * drives the fišă, the confidence engine (`extract` → which document field to read), and the
 * output adapter (CSV column / extension selector via `insuretechKey`).
 *
 * NOTE: order/labels are a first pass from the brief; reconcile against the live Insuretech
 * form during the screen-share spike, and fill in `insuretechKey` then.
 */

export type FieldGroup = "client" | "sofer" | "vehicul" | "valabilitate";

/** Where a value originates. "manual" = not on any document (broker-entered / user-set). */
export type FieldSource = "buletin" | "talon" | "permis" | "manual";

/** Which extracted document + field a value is read from (drives `buildFisa`). */
export interface FieldExtract {
  doc: "buletin" | "talon" | "permis";
  key: string;
}

export interface FieldDef {
  /** stable id used across fišă, adapter and storage, e.g. "client.cnp" */
  id: string;
  /** Romanian label, in Insuretech's wording */
  label: string;
  group: FieldGroup;
  source: FieldSource;
  /** deterministic validator that gates this field's confidence, if any */
  validator?: "cnp" | "mrz" | "vin" | "date";
  /** which extracted document field this value comes from (absent for manual fields) */
  extract?: FieldExtract;
  /** CSV column / DOM selector for the output adapter — filled during the Insuretech spike */
  insuretechKey?: string;
}

export const FIELD_REGISTRY: FieldDef[] = [
  // §2 Client
  { id: "client.cnp", label: "CNP", group: "client", source: "buletin", validator: "cnp", extract: { doc: "buletin", key: "cnp" } },
  { id: "client.cetatenie", label: "Cetățenie", group: "client", source: "buletin", extract: { doc: "buletin", key: "cetatenie" } },
  { id: "client.nume", label: "Nume", group: "client", source: "buletin", extract: { doc: "buletin", key: "nume" } },
  { id: "client.prenume", label: "Prenume", group: "client", source: "buletin", extract: { doc: "buletin", key: "prenume" } },
  { id: "client.sex", label: "Sex", group: "client", source: "buletin", extract: { doc: "buletin", key: "sex" } },
  { id: "client.telefon", label: "Telefon", group: "client", source: "manual" },
  { id: "client.email", label: "Email", group: "client", source: "manual" },
  { id: "client.dataNasterii", label: "Data nașterii", group: "client", source: "buletin", validator: "date", extract: { doc: "buletin", key: "dataNasterii" } },
  { id: "client.actTip", label: "Act identitate — tip", group: "client", source: "manual" },
  { id: "client.actSerie", label: "Serie act", group: "client", source: "buletin", extract: { doc: "buletin", key: "serie" } },
  { id: "client.actNumar", label: "Număr act", group: "client", source: "buletin", extract: { doc: "buletin", key: "numar" } },
  { id: "client.actExpirare", label: "Expirare act", group: "client", source: "buletin", validator: "date", extract: { doc: "buletin", key: "valabilitate" } },
  { id: "client.adresa", label: "Adresă (domiciliu)", group: "client", source: "buletin", extract: { doc: "buletin", key: "adresa" } },

  // §5 Vehicul
  { id: "vehicul.numarInmatriculare", label: "Număr înmatriculare", group: "vehicul", source: "talon", extract: { doc: "talon", key: "numarInmatriculare" } },
  { id: "vehicul.vin", label: "Serie șasiu (VIN)", group: "vehicul", source: "talon", validator: "vin", extract: { doc: "talon", key: "vin" } },
  { id: "vehicul.marca", label: "Marca", group: "vehicul", source: "talon", extract: { doc: "talon", key: "marca" } },
  { id: "vehicul.model", label: "Model", group: "vehicul", source: "talon", extract: { doc: "talon", key: "model" } },
  { id: "vehicul.anFabricatie", label: "An fabricație", group: "vehicul", source: "talon", extract: { doc: "talon", key: "anFabricatie" } },
  { id: "vehicul.masaMaxima", label: "Masă maximă", group: "vehicul", source: "talon", extract: { doc: "talon", key: "masaMaxima" } },
  { id: "vehicul.cilindree", label: "Cilindree", group: "vehicul", source: "talon", extract: { doc: "talon", key: "cilindree" } },
  { id: "vehicul.locuri", label: "Locuri", group: "vehicul", source: "talon", extract: { doc: "talon", key: "locuri" } },
  { id: "vehicul.putereKw", label: "Putere (kW)", group: "vehicul", source: "talon", extract: { doc: "talon", key: "putereKw" } },
  { id: "vehicul.categorie", label: "Categorie", group: "vehicul", source: "talon", extract: { doc: "talon", key: "categorie" } },
  { id: "vehicul.combustibil", label: "Combustibil", group: "vehicul", source: "talon", extract: { doc: "talon", key: "combustibil" } },
  { id: "vehicul.serieCiv", label: "Serie CIV", group: "vehicul", source: "talon", extract: { doc: "talon", key: "serieCiv" } },
  { id: "vehicul.dataPrimaInmatriculare", label: "Data primei înmatriculări", group: "vehicul", source: "talon", validator: "date", extract: { doc: "talon", key: "dataPrimaInmatriculare" } },

  // §6 Valabilitate (broker-set, not from documents)
  { id: "valabilitate.dataStart", label: "Dată început", group: "valabilitate", source: "manual", validator: "date" },
  { id: "valabilitate.dataFinal", label: "Dată sfârșit", group: "valabilitate", source: "manual", validator: "date" },
];

/** Fields in registry order for a given group — used to render each fišă section. */
export const fieldsByGroup = (group: FieldGroup): FieldDef[] =>
  FIELD_REGISTRY.filter((f) => f.group === group);
