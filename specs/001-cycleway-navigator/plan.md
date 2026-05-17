# Implementation Plan: CycleWay Navigator

**Branch**: `001-cycleway-navigator` | **Date**: 2026-05-17 | **Spec**: `specs/001-cycleway-navigator/spec.md`

## Summary

Refactor the CycleWay single-file HTML app into a modular multi-file project following the constitution's
Single Responsibility principle. Each concern (geocoding, routing, weather, traffic, scoring, map, UI)
becomes its own ES module. The app is served statically with no build step.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2020, ES modules)

**Primary Dependencies**: Leaflet 1.9.4 (CDN), Open-Meteo API, Nominatim OSM, OSRM public instance

**Storage**: Browser `localStorage` for API keys only

**Testing**: Manual browser testing; each module is independently importable

**Target Platform**: Modern browsers, served via HTTP (python3/Node.js/any static server)

**Project Type**: Static web application

**Performance Goals**: Route + weather displayed within 5s on a standard connection

**Constraints**: No build tools, no bundler, no server-side code, no framework

**Scale/Scope**: Single user, personal cycling tool

## Constitution Check

- [x] **Spec-First**: Spec written and reviewed before this plan
- [x] **Zero-Build**: ES modules, CDN Leaflet, no bundler
- [x] **Single Responsibility**: One module per concern (see structure below)
- [x] **Free-Tier First**: OSRM + Open-Meteo = full functionality with zero keys
- [x] **Agentic Tool Design**: Each API wrapper is an independent async function with error boundary

## Project Structure

### Documentation

```text
specs/001-cycleway-navigator/
├── spec.md          ← Feature specification
├── plan.md          ← This file
└── tasks.md         ← Task checklist
```

### Source Code

```text
cycleway/
├── index.html               ← Clean HTML shell; loads CSS + Leaflet + app.js (module)
├── serve.sh                 ← One-command local server script
├── css/
│   └── styles.css           ← All visual styles extracted from original HTML
└── js/
    ├── config.js            ← API endpoint constants (no logic)
    ├── utils.js             ← Pure formatters: fmtDist, fmtTime
    ├── geocoding.js         ← geocode(q) → Coordinate  [Nominatim]
    ├── routing.js           ← getBikeRoute(), getCarRoute()  [GH / OSRM]
    ├── weather.js           ← getWeather(), wxCode()  [Open-Meteo]
    ├── traffic.js           ← getTrafficFlow()  [TomTom]
    ├── scoring.js           ← cyclingScore(), clothingAdvice(), windDirLabel()
    ├── map.js               ← initMap(), renderMapRoute()  [Leaflet]
    ├── ui.js                ← renderWeather(), renderRoute(), toast(), setBusy()
    └── app.js               ← Orchestrator: state, event wiring, findRoute()
```

**Dependency tree** (no circular imports):
```
app.js
 ├── geocoding.js   → config.js
 ├── routing.js     → config.js
 ├── weather.js     → config.js
 ├── traffic.js     → config.js
 ├── scoring.js     (no deps)
 ├── map.js         → utils.js
 └── ui.js          → utils.js, scoring.js, weather.js
```

## Module Contracts

| Module | Exports | Inputs | Output |
|--------|---------|--------|--------|
| `config.js` | 5 URL constants | — | — |
| `utils.js` | `fmtDist(m)`, `fmtTime(s)` | number | string |
| `geocoding.js` | `geocode(q)` | string | `{ lat, lng, name }` |
| `routing.js` | `getBikeRoute(from, to, ghKey, prefs)`, `getCarRoute(from, to)` | Coordinate, string, object | RouteResult or null |
| `weather.js` | `getWeather(lat, lng)`, `wxCode(code)` | number | WeatherData or [string, string] |
| `traffic.js` | `getTrafficFlow(lat, lng, key)` | number, string | TrafficFlow or null |
| `scoring.js` | `cyclingScore(wx)`, `clothingAdvice(wx)`, `windDirLabel(deg)` | WeatherData | number, object, string |
| `map.js` | `initMap()`, `renderMapRoute(from, to, bike, car, prefs)` | Coordinate, RouteResult, object | side effects |
| `ui.js` | `renderWeather(wx)`, `renderRoute(bike, car, traffic, from, to, prefs)`, `toast(msg, type)`, `setBusy(on)` | various | side effects |
| `app.js` | none (entry point) | DOM events | orchestrates all above |

## Implementation Notes

- `app.js` holds the `prefs` state object and passes it as a parameter to functions that need it.
- Leaflet is loaded as a global via `<script>` tag before `app.js`; `/* global L */` annotation suppresses linter warnings in `map.js`.
- HTML chip buttons use `data-pref` attributes; `app.js` attaches delegated `click` listeners.
- API keys are read from `<input>` elements and written to `localStorage` on `change`.
- The `cycleway-package/` directory (single-file version) is preserved as a portable fallback.
