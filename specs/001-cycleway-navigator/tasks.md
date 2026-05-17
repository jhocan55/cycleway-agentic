# Tasks: CycleWay Navigator

**Input**: `specs/001-cycleway-navigator/spec.md` + `specs/001-cycleway-navigator/plan.md`

## Phase 1: Setup

- [x] T001 Create directory structure: `cycleway/`, `cycleway/css/`, `cycleway/js/`, `specs/001-cycleway-navigator/`
- [x] T002 Write constitution in `.specify/memory/constitution.md`
- [x] T003 Write spec in `specs/001-cycleway-navigator/spec.md`
- [x] T004 Write plan in `specs/001-cycleway-navigator/plan.md`

---

## Phase 2: Foundational Modules (no user story dependencies)

**Purpose**: Shared infrastructure all user stories depend on

- [x] T005 [P] Create `cycleway/js/config.js` — API endpoint constants
- [x] T006 [P] Create `cycleway/js/utils.js` — `fmtDist()`, `fmtTime()` pure formatters
- [x] T007 [P] Create `cycleway/css/styles.css` — full extracted stylesheet
- [x] T008 Create `cycleway/index.html` — clean HTML shell referencing CSS + JS modules

**Checkpoint**: Open `index.html` via server — map renders, empty state visible, preference chips render

---

## Phase 3: US1 — Route Planning (P1)

**Goal**: Geocode two addresses and display a bike route on the map

- [x] T009 [P] [US1] Create `cycleway/js/geocoding.js` — `geocode(q)` using Nominatim
- [x] T010 [P] [US1] Create `cycleway/js/routing.js` — `getBikeRoute()` (GH + OSRM fallback) and `getCarRoute()`
- [x] T011 [P] [US1] Create `cycleway/js/map.js` — `initMap()` and `renderMapRoute()`
- [x] T012 [US1] Create `cycleway/js/app.js` — orchestrator with `findRoute()`, pref state, event wiring

**Checkpoint**: Plan a route → polyline appears, stats show distance/time/speed, turn-by-turn visible

---

## Phase 4: US2 + US3 — Weather & Clothing (P1/P2)

**Goal**: Fetch weather and display conditions score + clothing advisor

- [x] T013 [P] [US2] Create `cycleway/js/weather.js` — `getWeather()` and `wxCode()`
- [x] T014 [P] [US3] Create `cycleway/js/scoring.js` — `cyclingScore()`, `clothingAdvice()`, `windDirLabel()`
- [x] T015 [US2,US3] Create `cycleway/js/ui.js` — `renderWeather()`, `renderRoute()`, `toast()`, `setBusy()`
- [x] T016 [US2,US3] Wire weather + clothing into `app.js` `findRoute()` flow

**Checkpoint**: Plan route → weather card appears with score bar + clothing grid below

---

## Phase 5: US4 — Traffic Correlation (P2)

**Goal**: Optionally fetch TomTom traffic and show shared-road alerts

- [x] T017 [US4] Create `cycleway/js/traffic.js` — `getTrafficFlow()` with graceful null return
- [x] T018 [US4] Wire traffic into `app.js` parallel fetch and `ui.js` `renderRoute()` traffic strip

**Checkpoint**: With TomTom key — traffic strip shows speed + congestion level. Without key — fallback strip renders.

---

## Phase 6: US5 — Route Preferences (P3)

**Goal**: Preference chips influence routing profile and map display

- [x] T019 [US5] Add `data-pref` attributes to chips in `index.html`
- [x] T020 [US5] Add delegated pref listeners in `app.js`; pass `prefs` to `getBikeRoute()` and `renderMapRoute()`
- [x] T021 [US5] Add swap-locations listener in `app.js`

**Checkpoint**: Toggle Fastest → GH uses racingbike. Toggle off Avoid traffic → car overlay disappears.

---

## Phase 7: Polish & Serve

- [x] T022 Create `cycleway/serve.sh` — one-command Python HTTP server
- [x] T023 Verify app end-to-end: Strasbourg Cathedral → Strasbourg Gare, no API keys
- [x] T024 Verify fallback: GraphHopper key error → OSRM used, toast shown

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1
- **Phase 3**: Depends on Phase 2 (config, utils, CSS, HTML must exist)
- **Phase 4**: Can start alongside Phase 3 for T013/T014; T015/T016 need Phase 3 complete
- **Phase 5**: Depends on Phase 4 (ui.js must exist before wiring traffic)
- **Phase 6**: Depends on Phase 3 (app.js must exist to add listeners)
- **Phase 7**: Depends on all phases

### Parallel Opportunities

Tasks marked [P] within a phase can run simultaneously (different files, no conflicts):
- T005, T006, T007 — all independent module files
- T009, T010, T011 — all independent module files
- T013, T014 — independent of each other
