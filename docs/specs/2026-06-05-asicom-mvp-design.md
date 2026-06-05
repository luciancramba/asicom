# Asicom MVP — design spec

_Date: 2026-06-05 · Status: approved, in build (PR1)_

## 1. Context

Internal tool for an insurance brokerage assistant (Lucian Tripon, ASICOM, Asigest network).
Client documents arrive as phone photos (buletin, talon, permis, ≤5 photos). Today he retypes
them into **Insuretech** (asigest.insuretech.ro), a web SPA. ~139 policies/month. The pain is
retyping time + data-entry errors.

Asicom: photos in → AI extraction → deterministic validation → **fișă de emitere** (fields in
Insuretech's order, source doc beside each, trust badges, fast copy / autofill) → issuance in
~2 min instead of ~15.

## 2. Core principle — trustable extraction

The product is not extraction, it is _trustable_ extraction. A field is only **🟢 verified** when a
deterministic check passed; **🟡 unverified** when extracted but no checksum exists (eyeball it);
**🔴 failed** when a validator failed or two documents disagree. _Green must mean machine-verified,
never machine-guessed._ This is what makes "no silent errors" true and what earns a domain
expert's trust.

## 3. Scope

**In (the portal):**
- Single-user auth → mobile-first upload (≤5 photos) → dosar created
- Pipeline: one vision call/image (classify + extract) → zod-validated JSON → deterministic
  validators → three-state confidence
- Fišă de emitere: Insuretech field order, **document-level** source crop per group, badges,
  copy-per-field with auto-advance, manual override
- Dashboard: dosare list (status chips, search by name/CNP/plate, KPI strip) + client record
  (auto-created by CNP: contact, vehicles, policies)
- Emis: drag policy PDF → text-parse policy #/insurer/dates → registry; + one-click confirm
- GDPR: raw images on filesystem (purged), structured data in SQLite (retained); purge timer
- Deploy: Caddy + Node + SQLite on the VPS, asicom.cramba.ro, TLS

**Deferred:**
- **Output adapter implementation** — gated on Insuretech's answer (see §7)
- WhatsApp/Twilio intake (v1.1)
- v1.5 reminder engine (the registry is built now; the engine is later)
- Field-level crop highlighting (document-level for the MVP)

## 4. Architecture — TypeScript monorepo

TypeScript everywhere, so the field-map is shared between the fišă and the output adapter
(define once, use twice). Any other backend duplicates that mapping in two languages.

```
asicom/
  apps/web/            Next.js 16 (App Router) + Tailwind 4 — upload, fišă, dashboard, API, vision
  apps/extension/      wxt MV3 — added only if the CSV path doesn't exist
  packages/shared/     THE SPINE — zod schemas · field registry · validators · confidence model
  infra/               Caddyfile (TLS + reverse proxy) · purge.ts (GDPR retention)
  docs/specs/          this file
```

`packages/shared/fields.ts` is the linchpin: one `FieldDef[]` registry in Insuretech order, with
an `insuretechKey` per field (CSV column / DOM selector) filled in during the spike. The fišă
renders + validates from it; the adapter fills from it.

## 5. Data model (SQLite / Drizzle)

- **clients** — id, **cnp (unique)**, nume, prenume, sex, data_nasterii, telefon, email,
  adresa_json, act_json, timestamps — auto-matched by CNP
- **vehicles** — id, client_id, plate, vin, marca, model, an, data_json
- **dosare** — id, status (`primit→in_procesare→de_verificat→gata→emis`), client_id,
  minutes_saved_est, notes, created_at, processed_at, emis_at
- **photos** — id, dosar_id, filepath, doc_type, uploaded_at, **purged_at** (GDPR)
- **extractions** — id, dosar_id, photo_id, doc_type, fields_json, confidence_json, model_used
- **policies** — id, dosar_id, client_id, vehicle_id, policy_number, insurer, type, valid_from,
  valid_to, source (`pdf|manual`) ← the v1.5 reminder registry

GDPR split: bulky/sensitive raw images live on the **filesystem** and are purged; only minimal
**structured** data lives in SQLite and is retained. Retention default: **14 days** post-Emis,
30 days for abandoned dosare.

## 6. Extraction schemas + confidence

Per doc type (zod): `buletin`, `talon`, `permis`, `policy`. All fields optional — a missing field
is a confidence concern, not a schema error. Confidence is computed _after_ extraction by
deterministic validators, never from the model's self-reported score:

- **CNP** → control digit + decodes sex/birthdate/county → cross-checks `sex` & `dataNasterii` (🟢)
- **MRZ** → checksums, where the card has an MRZ (newer eID/CI only)
- **VIN** → format only; ISO check digit unreliable on EU VINs, so never hard-fail on it
- **Dates** → plausibility / expiry-in-future
- **Names/address** → no checksum → cross-document agreement (buletin vs permis), else 🟡

## 7. Output adapter — swappable, gated

The verified fišă feeds an adapter. Resolution pending Insuretech's answer:

1. **CSV / structured import** _(preferred)_ — if Insuretech ingests a file. No DOM fragility,
   survives their UI changes. May remove the need for an extension entirely.
2. **Chrome extension autofill** _(fallback)_ — MV3 content script fills the SPA via native value
   setter + dispatched events; data-driven selectors from the field registry, plus a guided-fill
   fallback (click field → type next value) if hard selectors prove fragile.
3. **Copy-per-field** _(always-on baseline)_ — built into the fišă.

**Critical path:** confirming any autofill needs ~30–45 min on the authenticated Insuretech form
(the §4 screen-share spike) — selectors, whether the SPA accepts programmatic fills, and the
search-by-CNP/plate behaviour (which may mean filling 5 fields, not 25).

## 8. Build order (PR-sized)

1. **chore/scaffold** — monorepo + shared spine + building skeleton _(this PR)_
2. **feat/upload** — single-user auth + mobile upload + dosar create
3. **feat/pipeline** — vision classify+extract + validators + confidence _(crown jewel)_
4. **feat/fisa** — fišă de emitere _(trust machine)_
5. **feat/dashboard** — dosare list + client record
6. **feat/emis-purge** — PDF→registry + one-click confirm + purge timer
7. **feat/output-adapter** — _gated_ — CSV or extension once Insuretech answers

## 9. Decisions

- Stack: **TypeScript / Next.js 16 / wxt**, SQLite (better-sqlite3 + Drizzle), Caddy, single VPS
- Vision: **Sonnet** default extract, **escalate to Opus** on a failed check / low legibility.
  Cost is a non-issue at ~695 images/mo — pick for accuracy, escalate on legibility not price
- One vision call/image (classify + extract together), not two passes
- Crops: **document-level** (whole classified photo beside its field-group), not per-field boxes
- Auth: single hardcoded user (PR2), not magic link
- Retention N = 14 days post-Emis (config)

## 10. Risks / open

- **Insuretech access** is the gating dependency for the adapter — schedule the spike early
- Real-photo accuracy unknown until Tripon's document sets arrive → build/test on our own
  buletin/talon/permis meanwhile
- Field registry order/labels are a first pass from §2 → reconcile against the live form
- Single VPS = SPOF → nightly SQLite file backup
