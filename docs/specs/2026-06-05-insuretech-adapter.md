# PR7 — Insuretech output adapter

_Date: 2026-06-05 · Status: design-only, gated on the screen-share spike_

## What PR7 ships

The verified fišă becomes the source of truth for a policy emission. PR7 is the bridge from
that source to the Insuretech form (asigest.insuretech.ro). Three layers, ordered by trust:

1. **Manual copy** _(always-on baseline, already shipped)_ — per-field "Copiază" buttons with
   auto-advance; works on any backoffice without integration.
2. **Export adapter** _(shipped in this PR, before the spike)_ — CSV/JSON/TSV/plain/Insuretech-
   flat-CSV downloads + clipboard copy. Broker can paste into any system that accepts these.
3. **Browser extension** _(post-spike)_ — MV3 content script that fills the Insuretech SPA
   programmatically. Gated on knowing the SPA's DOM contract.

This doc covers layer 3 — what the extension does and what we need from the spike.

## The screen-share spike

Plan a 30–45 min call with Tripon on the Insuretech form:

1. **Confirm import path** — does Insuretech accept any structured import? If yes, our
   `exportCsvFlat` shape (one row, columns = field ids) may already work after a column-name
   tweak. If no, we go to the extension.
2. **Map every field's selector** — for each entry in `packages/shared/src/fields.ts`,
   record the CSS / DOM selector on the live form. Updated as `FieldDef.insuretechKey`.
3. **Probe input behaviour** — try a programmatic `nativeInputValueSetter` + `dispatchEvent`
   (`input`, `change`, `blur`) on each field. Verify React/Vue/Angular state updates.
4. **Probe search-by-CNP/plate** — if the form auto-populates after typing a CNP, we may need
   only 5 fields filled (the rest derive). Big win.
5. **Identify form-submission gate** — what triggers "save"? What is the success signal?

Output of the spike:
- An updated `fields.ts` with `insuretechKey` filled in
- A boolean: "this form accepts programmatic fills (yes/no)"
- A list of search-by-CNP/plate auto-populated fields (so we skip filling them)

## Extension architecture (after spike)

```
apps/extension/                          (wxt MV3)
  manifest.ts                            (host_permissions: asigest.insuretech.ro)
  background.ts                          (sw — receives field payload from web app)
  content/
    insuretech.ts                        (auto-fill on the Insuretech form)
    guided-fill.ts                       (fallback: click-field-then-paste)
  ui/
    popup.tsx                            (current dosar + "fill all" button)
    panel.tsx                            (side panel; progresses through fields)
  lib/
    selectors.ts                         (per-field selector map; tuned per-spike)
    react-set.ts                         (nativeInputValueSetter + change/blur events)
```

### Flow

1. Broker has a dosar at status `gata` on Asicom.
2. Click "Trimite în Insuretech" → web app sends the field map to the extension via a
   `chrome.runtime.sendMessage` (background → content script in active Insuretech tab).
3. Content script reads the selector map from `selectors.ts`, walks the form, sets each value
   using `react-set.ts` (`HTMLInputElement.prototype.value` setter + dispatched events).
4. Returns a per-field result: filled / failed / not-found. Asicom shows the report.
5. Broker reviews and clicks "Salvează" inside Insuretech themselves — we don't auto-submit.

### Selector strategy

- **Stable selectors first** — prefer `[name=]`, `[data-field=]`, `[aria-label=]`, fall back to
  IDs only if the form generates stable IDs.
- **No XPath** — too fragile across Insuretech UI updates.
- **Versioning** — `selectors.ts` exports a version + last-verified-date. If a fill fails for
  ≥3 fields in a row, the extension warns the broker the selectors may be stale.

### Programmatic fill

React/Vue/Angular inputs ignore direct `el.value = "x"` assignments. The pattern is:

```ts
const setter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value",
)!.set!;
setter.call(el, value);
el.dispatchEvent(new Event("input", { bubbles: true }));
el.dispatchEvent(new Event("change", { bubbles: true }));
el.dispatchEvent(new Event("blur", { bubbles: true }));
```

For `<select>` and custom dropdowns we may need to dispatch `mousedown` + select an option
text-match; spike will tell.

### Fallback: guided fill

If programmatic fill doesn't work on a given field type (custom date picker, masked input,
modal dropdown), fall through to **guided fill**: the extension overlays a small chip on the
focused field that shows what to paste, and broker hits Ctrl+V. Slower but always works.

## Risk register

- **Selectors break on Insuretech updates** → versioned selectors + freshness check + manual
  re-spike when the broker reports >3 fail rate.
- **Insuretech detects automation and rate-limits / blocks** → respect human cadence (250ms
  between fills), surface a "stop & resume" control, document acceptable use with Insuretech.
- **Customer PII in extension state** → never persist; live only while the tab is open;
  cleared on navigation.

## What's shipped today (no spike needed)

- `exportCsv` / `exportCsvFlat` / `exportTsv` / `exportPlain` / `exportJson` in `@asicom/shared`
- `<ExportMenu>` component on every fišă with Copy + Download per format
- 5 lock-down tests in `packages/shared/src/export.test.ts`

Tripon can already use the **CSV Insuretech-ready** format (single row, columns = field ids)
as a manual upload if Insuretech supports CSV import, and the spike will only need to confirm
column-name mappings (not re-architect the export layer).
