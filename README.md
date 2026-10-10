# AwaazEdge (TransitTriage)

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

---

## Web Application (`apps/web`)

A production-grade, offline-first, dual-sided Single Page Application built with **React 18 + Vite + TypeScript + Tailwind CSS + Zustand + Dexie IndexedDB + Lucide React + Recharts + i18next**.

Running on **`http://localhost:5173/`**

### Two-Sided Portals

1. **Passenger Portal (`/app`)**:
   - **Mobile-first** layout with generous touch targets (min 44px) and clear status indicators.
   - **QR deep-linking**: Pre-populates station and asset from URL query parameters (e.g. `?station=STN-01&asset=LIFT-03`).
   - **Multilingual submission**: Gujarati script, Devanagari script, English, and Romanized Gujlish.
   - **Ticket Tracker (`/app/track/:id`)**: Live timeline (Submitted $\to$ Triaged $\to$ Assigned $\to$ In Progress $\to$ Resolved).
   - **Privacy & Trust Guarantee**: Never exposes internal urgency scores, algorithmic triage lanes, or internal department tags to passengers.

2. **Station Controller & Admin Portal (`/admin`)**:
   - **Desktop/Tablet control-room interface** styled in calm neutral slate surfaces with deep teal (`#0D9488`) accent.
   - **Triage Queue (`/admin/triage`)**:
     - Pinned **"Needs human eyes"** lane at the top for ambiguous cases, negation flags, and zero-match input.
     - Automated triage queue sorted by deterministic Urgency Score (0–100).
     - Filter chips by department, urgency band (Critical, High, Medium, Low), and search terms.
   - **Complaint Detail Drawer**:
     - Highlights trigger words in original script with color-coded offsets.
     - Full urgency breakdown card displaying base score, triggered danger floor, and accumulated modifiers.
     - One-click Department re-assignment & Urgency override.
     - Complainant draft response editor populated with verified multilingual templates and personalized placeholders (`{{station}}`, `{{asset}}`, `{{tracking_id}}`).
     - "Approve & Send Draft" action tracking controller approvals.
   - **Intake & Batch Paste (`/admin/intake`)**:
     - Direct text submission or multi-line batch complaints paste.
     - Live dry-run classification preview before ingestion into the triage system.
   - **Incidents & Clustering (`/admin/incidents`)**:
     - Groups complaints sharing the same station, asset/department, and within a 6-hour sliding window with Jaccard word similarity $\ge 0.4$.
     - One-click "Bulk Action" to acknowledge and resolve co-occurring complaints.
   - **Hotspots Heatmap & Analytics (`/admin/hotspots`)**:
     - 10 Station $\times$ 5 Department CSS grid matrix with deep teal/amber/rose intensity shading.
     - Chronic repeat-offender asset badges (e.g. `LIFT-03` at Paldi, `ESC-01` at Kalupur).
     - Daily complaint trend line charts powered by Recharts.
   - **Templates Management (`/admin/templates`)**:
     - Station response templates across Gujarati, Hindi, and English with placeholder token validation.
   - **Model & Safety Configuration (`/admin/model`)**:
     - Interactive Cost-Benefit decision matrix sliders ($C_{\text{miss}}$ vs $C_{\text{false}}$) dynamically recomputing the Bayes optimal threshold $\tau = \frac{C_{\text{false}}}{C_{\text{miss}} + C_{\text{false}}}$.
     - Real-time simulation showing expected triage volume vs safety-miss rate.
     - Architecture hook for future ONNX runtime integration.
   - **Sync Center (`/admin/sync`)**:
     - Visual IndexedDB event journal (complaint creation, department overrides, draft approvals).
     - Online/Offline simulated link toggle with manual and automatic drain of the ULID-ordered outbox.

---

## Demo Walkthrough Script

Follow these 6 steps to experience the complete end-to-end functionality of TransitTriage:

### Step 1: Submit a Gujlish Complaint on `/app`
1. Navigate to **`http://localhost:5173/app`** (or click the **Passenger Portal** link in the header).
2. Note the pre-populated or selectable station: **Paldi (STN-02)** and asset **LIFT-03 (Elevator)**.
3. Paste the following authentic Gujlish complaint into the grievance box:
   ```text
   lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe
   ```
4. Enter optional phone `9876543210` and click **"Submit Complaint"**.
5. You will see the confirmation screen with a generated Tracking ID (e.g. `TRX-XXXXXX`) and a passenger timeline. Notice that internal urgency points and triage lanes are strictly hidden from this passenger view.

### Step 2: Observe at Top of `/admin` with Stuck-Floor 85 and Modifiers
1. Click the header portal switcher to jump to **Station Controller (`/admin`)**.
2. On the **Triage Queue** tab, the newly submitted complaint appears at the very top of the automated queue with **Urgency Score 100/100** and a bright red `[CRITICAL]` badge.
3. Click the complaint card to open the **Detail Drawer**:
   - **Trigger Words**: Note `"lift"` highlighted in purple and `"fasai gaya"` highlighted in red.
   - **Urgency Breakdown**:
     - Base (safety): **+40 pts**
     - Danger floor (stuck): **85 pts**
     - Modifier (Vulnerable Person - elderly): **+10 pts**
     - Modifier (Time Pressure - 5 min train): **+10 pts**
     - Total: **100 pts (Capped at 100)**
   - **Draft Response**: The system automatically drafts a Gujarati/Gujlish response using the emergency template with station and tracking placeholders populated.

### Step 3: Toggle Offline Mode & Import Batch via Intake Tab
1. In the top navigation bar, toggle the **Network status switch** from `Online` to **`Offline`** (an amber offline indicator appears).
2. Click the **"Intake"** tab in the admin navigation.
3. Scroll down to **"Batch Paste Intake"** and click **"Load Realistic Gujarat Metro Batch"** (loads 4 multilingual complaints across Gujarati script, Hindi, and Gujlish).
4. Click **"Run Dry-Run Preview"** to inspect how the rules engine classifies them.
5. Click **"Ingest 4 Complaints"**. All 4 complaints are triaged instantly and stored in local **Dexie IndexedDB** without needing an active internet connection.

### Step 4: Correct a Label in Drawer & Observe "Learned from your correction"
1. Return to the **"Triage Queue"** tab.
2. Open any complaint (e.g. a complaint currently labeled `cleanliness`).
3. Under **"Quick Actions"** in the drawer, click **"Move to Lifts"** or **"Move to Safety"**.
4. Click the **"Learn & Update Rule"** button.
5. A confirmation badge appears: **"Learned from your correction: kNN / Lexicon updated"** and a green toast notification confirms the change has been recorded into the offline event journal.

### Step 5: Disable Offline Mode & Watch the Sync Progress
1. Click the **"Sync Center"** tab in the admin navigation.
2. Notice the **Pending Outbox** counter showing the queued sync mutations (complaint creations, overrides, draft approvals).
3. In the header, toggle the network status switch back to **`Online`**.
4. Click **"Drain Outbox Now"** (or watch the simulated automatic background sync).
5. Watch the sync progress bar complete, transitioning pending events into the permanent synced journal.

### Step 6: Open Hotspots to View Heatmap & Repeat Offenders
1. Click the **"Hotspots"** tab in the admin navigation.
2. View the **Station $\times$ Department CSS grid heatmap**:
   - Notice the high-density cell at **Paldi $\times$ Lifts** (chronic escalator/lift issues).
   - Notice the high-density cell at **Kalupur (Railway Station) $\times$ Safety** (congestion & ticketing machines).
3. Scroll down to **"Chronic Repeat Offenders"** to see specific problematic assets like **LIFT-03** flagged with maintenance alerts.
4. Review the 7-day complaint volume trend line chart at the bottom.

---

## Project Structure

```
transit-triage/
├── apps/
│   └── web/                   # Vite + React 18 + TypeScript + Tailwind SPA
│       ├── src/
│       │   ├── core/          # Interfaces (Classifier, SyncService, Cluster)
│       │   ├── db/            # Dexie.js IndexedDB schema & event log
│       │   ├── store/         # Zustand global application state
│       │   ├── components/    # Header, DetailDrawer, UrgencyBadge, Toasts
│       │   ├── pages/         # /app (Submit, Track) and /admin (7 views)
│       │   ├── mock/          # Seeded complaints, stations, assets, templates
│       │   └── i18n/          # Locales for English, Gujarati, Hindi
│       └── tailwind.config.js
├── packages/
│   └── core/                  # Deterministic Rules Engine (Zero external deps)
│       ├── src/
│       │   ├── normalize.ts   # NFC, Indic script detection, digit mapping
│       │   ├── lexicon.ts     # Boundary matcher, offset finder, negation logic
│       │   ├── urgency.ts     # Base + Floor + Modifiers score calculator
│       │   ├── safety-cost.ts # Bayes minimum risk decision matrix
│       │   ├── triage.ts      # End-to-end classifier & lane router
│       │   └── cli.ts         # Standalone CLI tool
│       └── __tests__/         # 84 Vitest unit tests
├── data/
│   ├── taxonomy.json          # Departments, subtopics, stations, assets
│   ├── lexicon/               # 5 department JSON lexicons in 4 forms
│   └── templates/             # Approved multilingual response templates
└── package.json
```

