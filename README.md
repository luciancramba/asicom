# Issuedoc

Internal tool for an insurance brokerage assistant (ASICOM / Asigest network). Client documents
arrive as phone photos (buletin, talon, permis); Issuedoc extracts the data, validates it
deterministically, and renders a **fișă de emitere** — every field in Insuretech's form order,
with a trust badge and the source document beside it — so issuance takes ~2 min instead of ~15.

**Core principle: trustable extraction.** A 🟢 field means *machine-verified* (e.g. CNP control
digit), not *guessed*. 🟡 means extracted but unverifiable (eyeball it). 🔴 means a validator
failed or two documents disagree. No silent errors.

## Output into Insuretech

The verified fišă feeds an **output adapter**, deliberately swappable:

1. **CSV/structured import** — preferred, if Insuretech supports it (no DOM fragility). _Pending their answer._
2. **Chrome extension autofill** — fallback, fills the SPA form directly.
3. **Copy-per-field** — always-on baseline, built into the fišă.

## Stack

TypeScript everywhere (the field-map is shared between the fišă and the adapter):

- `apps/web` — Next.js 16 (App Router) + Tailwind 4: upload, fišă, dashboard, API, vision
- `packages/shared` — zod schemas · canonical field registry · deterministic validators · confidence model
- `apps/extension` — Manifest V3 (wxt), added only if the CSV path doesn't exist
- `infra` — Caddyfile (TLS + reverse proxy) · purge script (GDPR retention)

Data: SQLite (single file, on the VPS). Raw images live on the filesystem and are **purged**
N days after a dosar is Emis; only minimal structured data is retained.

## Develop

```bash
npm install          # installs all workspaces
npm run dev          # Next.js dev server (apps/web)
npm run build        # typecheck shared + next build
npm test             # vitest (validators)
npm run lint         # eslint across workspaces
```

## Status

PR1 — scaffold: monorepo, shared spine, building skeleton. Auth + upload land in PR2.
See `docs/specs/2026-06-05-issuedoc-mvp-design.md`.
