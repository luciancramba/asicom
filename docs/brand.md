# Asicom brand — dev cheat-sheet

Condensed from **ASICOM Brand Book v1.0 final** (5 Jun 2026, Cramba App Studio). The brand book
PDF/docx is the source of truth; this is the implementation reference. Visual tokens live in
`apps/web/app/globals.css` (`@theme`); copy/voice in `apps/web/lib/brand.ts`.

## Name & voice
- Wordmark: **Asicom** (italic + orbit). Permanent lockup: **Asicom · Emitere asistată**.
- Slogans — one per context, never together, always with a period:
  - *"Documentul devine poliță."* — headline / sales.
  - *"Datele nu se transcriu. Se verifică."* — accuracy / MRZ / trust contexts.

## Logo
- v2 only. **White-on-blue** (app header, colored bg) · **blue-on-white** (docs, email, print).
- In code: `<AsicomLogo className="text-white" />` (recolour via text colour). Monogram (no orbit,
  `app/icon.svg`) for ≤40 px / avatar / favicon.
- Never: recolour (green/black/gradient on letters), deform, restyle the wordmark, split the orbit,
  or place the blue version on photos (use white). Clearspace = height of "A"; min 120 px wide.

## Colour — Tailwind tokens (utilities: `bg-asicom`, `text-asicom-mid`, …)
| Token | Hex | Use |
|---|---|---|
| `asicom` | #0A47A0 | primary — titles, buttons |
| `asicom-mid` | #1565C8 | logo-on-white, links, accents |
| `asicom-light` | #2E8FE6 | gradient, hover, secondary |
| `ink` | #1A1A1A | body text |
| `cloud` | #F4F6FA | section/card backgrounds |
| `ok` | #1F8A5B | ✓ verified — **UI only** |
| `warn` | #C77B00 | ⚠ verifică — **UI only** |

- Gradient: `bg-asicom-gradient` (135°, light → primary).
- Rule: **blue = brand, white = space, green/orange = signals.** >3 colours in a layout = wrong.
  Functional colours never appear in the logo.

## Type — 3 fonts, 3 roles (no fourth)
- `font-display` **Fraunces** — big titles, hero numbers, quotes (light, slightly tight). Never body/buttons.
- `font-sans` **Instrument Sans** — UI, body, buttons, eyebrows. Same as the wordmark.
- `font-mono` **JetBrains Mono** — **data only**: CNP, VIN, sums, dates (tabular figures).
- Max 2 weights on screen; important numbers **bold, not coloured**.

## Open question for PR4 (fišă badges)
Confidence is 3-state (`verified` / `unverified` / `failed`) but the brand defines only **two**
functional colours. Map `verified → ok` (green ✓) and `unverified → warn` (orange ⚠); decide the
`failed` treatment when building the badges — orange + ✗, or a restrained red as a documented
extension. Flag the choice to Lucian (don't silently add a 4th colour).
