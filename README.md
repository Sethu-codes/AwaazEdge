# TransitTriage

> **Offline-first two-sided transit complaint triage platform** (PWA + FastAPI + SQLite).
> Multilingual, multi-label complaint processing across Gujarati script, Devanagari (Hindi), English, and Romanized "Gujlish" / "Hinglish".

---

## Architecture Overview

```
transit-triage/
  apps/web/        (routes /app and /admin) [Phase 1+]
  packages/core/   (normalize, lexicon, urgency, safety-cost, template validators, shared types) [Phase 0]
  packages/ml/     (ONNX embedder, classifier head, kNN, online update) [Phase 2]
  packages/sync/   (event log, outbox, hybrid logical clock, reducers) [Phase 3]
  server/          (FastAPI backend) [Phase 1+]
  ml/              (data generation, LoRA training, export, evaluation) [Phase 5]
  data/            (taxonomy, lexicons, templates, stations, assets, test set) [Phase 0+]
```

---

## Phase 0: Rules-Only Brain (`packages/core` & `data/`)

Phase 0 establishes the deterministic rules engine and multilingual data dictionaries with zero dependencies on external ML services.

### 1. Data Definitions (`data/`)
- [`data/taxonomy.json`](data/taxonomy.json): 5 departments (`safety`, `lifts`, `staff_behaviour`, `fare`, `cleanliness`) with subtopics, asset types (`lift`, `escalator`, `toilet`, `ticket_machine`, `platform`, `gate`), 10 metro stations, and 32 tracked assets.
- [`data/lexicon/*.json`](data/lexicon/): Department lexicons in 4 linguistic forms:
  1. Gujarati script (`gu_script`)
  2. Devanagari script (`hi_script`)
  3. English (`en`)
  4. Romanized Gujlish / Hinglish (`romanized`)
  - Danger terms tagged with urgency floors (fire: 95, stampede: 95, unconscious: 95, child missing: 95, stuck: 85, harassment: 85, fell: 80) and marked `needs_native_speaker_review`.

### 2. Pure Functions in `packages/core`
- **Text Normalization (`packages/core/src/normalize.ts`)**:
  - Unicode NFC normalization.
  - Script detection: Gujarati (`U+0A80-0AFF`), Devanagari (`U+0900-097F`), Latin, mixed, unknown.
  - Indic digit normalization (Gujarati `૦-૯` and Devanagari `०-९` mapped to ASCII `0-9`).
  - Lowercase Latin while preserving Unicode scripts.
  - Expressive character lengthening collapse (3+ identical characters collapsed).
  - Common romanized spelling variant mappings (`nathi`, `che`/`chhe`, `kaam`/`kam`, `dhuvado`, `fasai`, `bachao`, etc.).
  - Language guess heuristic (`gu`, `hi`, `en`, `mixed`, `unknown`).
  - Keeps original text untouched and returns `{ script, lang_guess, normalized }`.
  - Treats all complaints as untrusted input.

- **Lexicon Matcher & Negation Detection (`packages/core/src/lexicon.ts`)**:
  - Unicode-aware boundary matching supporting Indic combining vowel marks (`\p{M}`).
  - Returns matched terms with character start/end offsets in original text for UI highlighting.
  - Negation detection (`"no fire"`, `"aag nathi"`, `"આગ નથી"`, `"आग नहीं"`): flags negation without zeroing the match.

- **Deterministic Urgency Calculator (`packages/core/src/urgency.ts`)**:
  - Base by department: `safety` 40, `lifts` 25, `staff_behaviour` 20, `fare` 15, `cleanliness` 10.
  - Danger floors: `fire` / `stampede` / `unconscious` / `child_missing` 95; `stuck` 85; `harassment` 85; `fell` 80.
  - Modifiers:
    - Vulnerable person (elderly / disabled / woman / child): +10 (capped at 15).
    - Time pressure ("train in 5 minutes", Gujarati/Hindi equivalents): +10.
    - Incident duplicates: +5 per doubling of cluster size ($N \ge 2$, capped at 15).
    - SLA age ramp: up to +20 as complaint age approaches SLA duration.
    - Public social media post tagging authorities/media: +5.
  - Formula: $\text{urgency} = \min(100, \max(\text{base}, \text{floor}) + \text{modifiers})$.
  - Bands: Critical ($\ge 85$), High ($65-84$), Medium ($40-64$), Low ($< 40$).
  - Returns a detailed breakdown array with points attribution.

- **Safety Cost Matrix (`packages/core/src/safety-cost.ts`)**:
  - Minimum expected risk decision rule:
    $$\text{Flag safety if } P \cdot C_{\text{miss}} > (1 - P) \cdot C_{\text{false}}$$
    $$\implies P > \frac{C_{\text{false}}}{C_{\text{miss}} + C_{\text{false}}}$$
  - Default costs: $C_{\text{miss}} = 20$, $C_{\text{false}} = 1$ ($\tau \approx 0.0476$).

- **Triage Brain & Lane Rules (`packages/core/src/triage.ts`)**:
  - Lane: `needs_human` if:
    1. No lexicon match is detected
    2. Negation is flagged on any term
    3. Language / script is unknown
  - Otherwise assigned to `automated` lane.

---

## CLI Usage

Run complaint triage directly via CLI:

```bash
pnpm triage "<complaint text>"
```

### Acceptance Example:
```bash
pnpm triage "lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe"
```

Output:
```text
======================================================
 TransitTriage — Rules-Only Brain (Phase 0 CLI)
======================================================
Original Text   : "lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe"
Normalized Text : "lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe"
Script Detected : latin
Language Guess  : gu
Primary Dept    : lifts
All Dept Labels : [lifts, safety]
Safety Cost Flag: YES (flagged)
Triage Lane     : AUTOMATED (Standard automated classification)
Negation Flagged: NO
------------------------------------------------------
Urgency Score   : 100/100 [Band: CRITICAL]
Urgency Breakdown:
  • [BASE    ]  +40 pts : Base (safety) -> Department base score for safety
  • [FLOOR   ]  +85 pts : Floor: stuck -> Critical danger floor triggered by stuck (85)
  • [MODIFIER]  +10 pts : Modifier: Vulnerable Person -> Vulnerable person involved (elderly) (+10, cap 15)
  • [MODIFIER]  +10 pts : Modifier: Time Pressure -> Immediate time pressure or imminent train departure (+10)
------------------------------------------------------
Matched Lexicon Terms (2):
  • "lift" -> dept: lifts, subtopic: lift, offsets: [0:4], form: en
  • "fasai gaya" -> dept: safety, subtopic: stuck, offsets: [8:18], form: romanized [DANGER FLOOR 85]
======================================================
```

---

## Test Suite

84 unit tests covering all 4 forms, script detection, digit normalization, negation detection, urgency modifier combinations, safety cost matrix math, and untrusted input security:

```bash
pnpm test
```

Typechecking:
```bash
pnpm typecheck
```
