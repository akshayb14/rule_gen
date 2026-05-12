# NIDEC · AI Rule Configurator

An interactive browser-based demo for authoring, validating, and approving product configuration rules for **Avtron Encoders** (a Nidec brand).

## Overview

The AI Rule Configurator lets two roles collaborate on encoder product rules — constraints that control which combinations of attributes are valid or invalid in the product configurator.

| Role | Responsibility |
|------|---------------|
| **Business SME** | Author rules in plain English, validate against existing logic, submit for approval |
| **Product Lead** | Review submissions, approve or reject, sync approved rules to production |

## Features

- **Role-based login** — separate flows for Business SME and Product Lead
- **AI rule creation** — describe a constraint in plain English; the AI converts it into a structured chip expression
- **Rule validation** — checks new rules against 2,430+ configurations for conflicts before submission
- **Review queue** — Product Lead approves, rejects, or requests changes
- **Live Avtron preview** — shows how an approved rule affects the real product configurator UI
- **AI insights** — surfaces overlapping rules, gaps, obsolete entries, and simplification opportunities
- **Library views** — browse drafts, conflicts, and sync history per product family

## Product Families

Covers 10 encoder families: `AV4`, `AV6A`, `AV6M`, `AV850`, `HS4`, `HS45`, `XR850`, `AV125`, `XR650`, `XR485`

## Getting Started

Because the app loads JSON data files via `fetch()`, it must be served over HTTP (not opened as a `file://` URL).

### Using Node.js (recommended)

A `serve.js` file is included at the project root. Run it directly with Node:

```bash
node serve.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Python

```bash
cd demo
python -m http.server 3000
```

> **Note:** On some Windows setups Python's `http.server` may fail to bind silently. Use the Node.js option if that happens.

## Demo Credentials

No real authentication — every visit starts at the **login / role chooser** screen. Click through to sign in instantly.

| Role | Name | Landing screen |
|------|------|---------------|
| Business SME | Eric Davis | Rules dashboard |
| Product Lead | Brian Wilson | Review queue |

> Session data is cleared on every page load — there is no persistent login between visits.

## File Structure

```
├── serve.js                        # Node.js static file server (run with: node serve.js)
└── demo/
    ├── index.html                  # Entry point — loads React + Babel from CDN
    ├── app.jsx                     # App shell, sidebar, topbar, routing
    ├── components.jsx              # Shared UI primitives (chips, modals, toasts, Avtron preview)
    ├── data.js                     # Mock data — families, rules, suggestions, demo prompts
    ├── screen-login.jsx            # Role chooser + SME / Lead login screens
    ├── screen-dashboard.jsx        # Rules table, search, filter
    ├── screen-create.jsx           # AI rule creation + validation flow
    ├── screen-flow.jsx             # Review detail, applied, insights screens
    ├── screen-review-queue.jsx     # Product Lead review queue
    ├── screen-library.jsx          # Families, drafts, conflicts library views
    ├── screen-help.jsx             # How-to-use guide
    ├── styles.css                  # All styles (no framework)
    ├── attr_sample.json            # Attribute options per family (codes + descriptions)
    ├── attr_options.json           # Full attribute options index
    ├── attr_index.json             # Attribute index metadata
    ├── rules_generated.json        # Pre-generated sample rules loaded at runtime
    └── avtron-logo.png             # Avtron Encoders logo
```

## Tech Stack

- **React 18** — loaded from CDN (no build step)
- **Babel Standalone** — JSX transpiled in-browser
- **Vanilla CSS** — custom design system, no UI framework
- **Node.js** — static file server (`serve.js`) included

## Notes

- This is a **prototype / wireframe demo** — no backend, all data is mocked
- Rule data is sourced from real `ProductRules.xlsx` and `ProductsAttributeOptionsCodes.xlsx` exports
- The Avtron configurator preview reflects live rule application (e.g. applying rule R-144 hides Connector C in real time)
- Session data (`nidec_user`, `nidec_screen`) is cleared from `localStorage` on every page load — every visit always starts at the login screen
- Script cache-busters (`?v=22`) in `index.html` ensure the browser always fetches the latest JS/CSS after updates
