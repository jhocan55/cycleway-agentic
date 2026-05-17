# CycleWay Constitution

## Core Principles

### I. Spec-First Development
Every feature begins as a written specification before any code is written.
Specs live in `specs/###-feature-name/spec.md` and must be approved before planning starts.
No code is written without a corresponding spec.

### II. Zero-Build Frontend
The app runs as static files served by any HTTP server — no bundler, no transpiler, no framework.
Vanilla JS with ES modules. Leaflet loaded via CDN. Dependencies added only when unavoidable.

### III. Single Responsibility per Module
Each JS module (`geocoding.js`, `routing.js`, `weather.js`, etc.) owns exactly one concern.
Modules communicate through explicit function parameters — no shared mutable globals.
No module imports from `app.js` (the orchestrator is the top of the dependency tree).

### IV. Free-Tier First (Progressive Enhancement)
Core functionality (map + route display) MUST work with zero API keys.
Optional keys (GraphHopper, TomTom) unlock premium features but never block the critical path.
Every external API call has a graceful fallback.

### V. Agentic Tool Design
External APIs (weather, routing, traffic, geocoding) are treated as agent tools:
each has a single async function, a clean input/output contract, and independent error handling.
This mirrors the tool-use pattern in the GitHub Certified Agentic AI Developer curriculum.

## Constraints

- **No backend**: All logic runs in the browser. No server-side code.
- **No personal data stored server-side**: API keys live in `localStorage` only.
- **No framework lock-in**: The app must remain portable and readable without any build toolchain.
- **Error boundaries**: Every external call is wrapped in try/catch with meaningful user-facing messages.

## Development Workflow

1. Write spec → 2. Write plan → 3. Write tasks → 4. Implement task by task → 5. Validate against spec

All feature branches follow the naming convention: `###-feature-name` (e.g., `001-cycleway-navigator`).

## Governance

This constitution supersedes any conflicting practice. Amendments require updating this file with a version bump.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
