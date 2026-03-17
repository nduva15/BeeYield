## Plain-English UI style guide

### Goals
- Keep behavior unchanged: this is a copy/typography cleanup.
- Prefer simple, direct language.
- Remove decorative ALL CAPS, heavy letter spacing, and token-like placeholder strings.
- Preserve accessibility: every form control has a label (or `aria-label`), and icon-only buttons have `aria-label`/`title`.

### Copy rules
- **Headings**: Title Case.
- **Helper text**: sentence case.
- **Buttons**: short verbs (“Save”, “Copy”, “Export PDF”, “Try again”).
- **Avoid jargon**: replace “Kernel/Telemetry/Registry/Protocol/Synthesis/Nominal/Orbital/Neural/Dossier/Vector” with plain equivalents.

### Token cleanup
- Replace UI tokens like `NO_HIVES_IN_APIARY` with human text.
- If you must keep a token for internal reasons, render it through `humanizeToken()` from `src/lib/copy.ts`.

### Typography rules
- Remove purely decorative Tailwind classes:
  - `uppercase`
  - `tracking-widest`, `tracking-[…]`
  - ultra-small caps “microcopy” that harms readability
- Keep uppercase only where it conveys meaning (e.g., “AI”, “QR”, legal acronyms).

