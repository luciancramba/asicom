/**
 * The canonical field registry — the spine of the whole product.
 *
 * Fields are listed in the exact order of the Insuretech emission form (§2 of the brief),
 * so the fišă renders top-to-bottom in the order the broker fills them. The SAME registry
 * drives the output adapter (CSV column / extension selector via `insuretechKey`), so the
 * field-map is defined once and used by both the fišă and the adapter.
 *
 * NOTE: order/labels are a first pass from the brief; reconcile against the live Insuretech
 * form during the screen-share spike, and fill in `insuretechKey` then.
 */

export type FieldGroup = "client" | "sofer" | "vehicul" | "valabilitate";

/** Where a value originates. "manual" = not on any document (broker-entered / user-set). */
export type FieldSource = "buletin" | "talon" | "permis" | "manual";

export interface FieldDef {
  /** stable id used across fišă, adapter and storage, e.g. "client.cnp" */
  id: string;
  /** Romanian label, in Insuretech's wording */
  label: string;
  group: FieldGroup;
  source: FieldSource;
  /** deterministic validator that gates this field's confidence, if any */
  validator?: "cnp" | "mrz" | "vin" | "date";
  /** CSV column / DOM selector for the output adapter — filled during the Insuretech spike */
  insuretechKey?: string;
}

export const FIELD_REGISTRY: FieldDef[] = [
  // §2 Client
  { id: "client.cnp", label: "CNP", group: "client", source: "buletin", validator: "cnp" },
  { id: "client.cetatenie", label: "Cetățenie", group: "client", source: "buletin" },
  { id: "client.nume", label: "Nume", group: "client", source: "buletin" },
  { id: "client.prenume", label: "Prenume", group: "client", source: "buletin" },
  { id: "client.sex", label: "Sex", group: "client", source: "buletin" },
  { id: "client.telefon", label: "Telefon", group: "client", source: "manual" },
  { id: "client.email", label: "Email", group: "client", source: "manual" },
  { id: "client.dataNasterii", label: "Data nașterii", group: "client", source: "buletin", validator: "date" },
  { id: "client.actTip", label: "Act identitate — tip", group: "client", source: "buletin" },
  { id: "client.actSerie", label: "Serie act", group: "client", source: "buletin" },
  { id: "client.actNumar", label: "Număr act", group: "client", source: "buletin" },
  { id: "client.actExpirare", label: "Expirare act", group: "client", source: "buletin", validator: "date" },
  { id: "client.adresa", label: "Adresă (domiciliu)", group: "client", source: "buletin" },

  // §5 Vehicul
  { id: "vehicul.numarInmatriculare", label: "Număr înmatriculare", group: "vehicul", source: "talon" },
  { id: "vehicul.vin", label: "Serie șasiu (VIN)", group: "vehicul", source: "talon", validator: "vin" },
  { id: "vehicul.marca", label: "Marca", group: "vehicul", source: "talon" },
  { id: "vehicul.model", label: "Model", group: "vehicul", source: "talon" },
  { id: "vehicul.anFabricatie", label: "An fabricație", group: "vehicul", source: "talon" },
  { id: "vehicul.masaMaxima", label: "Masă maximă", group: "vehicul", source: "talon" },
  { id: "vehicul.cilindree", label: "Cilindree", group: "vehicul", source: "talon" },
  { id: "vehicul.locuri", label: "Locuri", group: "vehicul", source: "talon" },
  { id: "vehicul.putereKw", label: "Putere (kW)", group: "vehicul", source: "talon" },
  { id: "vehicul.categorie", label: "Categorie", group: "vehicul", source: "talon" },
  { id: "vehicul.combustibil", label: "Combustibil", group: "vehicul", source: "talon" },
  { id: "vehicul.serieCiv", label: "Serie CIV", group: "vehicul", source: "talon" },
  { id: "vehicul.dataPrimaInmatriculare", label: "Data primei înmatriculări", group: "vehicul", source: "talon", validator: "date" },

  // §6 Valabilitate (broker-set, not from documents)
  { id: "valabilitate.dataStart", label: "Dată început", group: "valabilitate", source: "manual", validator: "date" },
  { id: "valabilitate.dataFinal", label: "Dată sfârșit", group: "valabilitate", source: "manual", validator: "date" },
];

/** Fields in registry order for a given group — used to render each fišă section. */
export const fieldsByGroup = (group: FieldGroup): FieldDef[] =>
  FIELD_REGISTRY.filter((f) => f.group === group);
