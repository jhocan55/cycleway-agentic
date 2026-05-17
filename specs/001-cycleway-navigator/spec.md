# Feature Specification: CycleWay Navigator

**Feature Branch**: `001-cycleway-navigator`

**Created**: 2026-05-17

**Status**: Implemented (v1.0) — agentic extension planned

**Input**: Smart bicycle route planner with live weather, traffic, and AI-style tool orchestration

---

## User Scenarios & Testing

### User Story 1 — Plan a Bicycle Route (Priority: P1)

A cyclist enters a start address and a destination. The app geocodes both, fetches the optimal bike route, displays it on an interactive map with turn-by-turn instructions, and shows key stats (distance, time, avg speed).

**Why this priority**: Core value proposition. Without this, nothing else matters.

**Independent Test**: Enter "Strasbourg Cathedral" → "Strasbourg Gare", click Find Route. A green polyline appears on the map with stats visible in the left panel.

**Acceptance Scenarios**:

1. **Given** valid start and destination, **When** the user clicks Find Route, **Then** a bike route appears on the map within 5 seconds.
2. **Given** an invalid location name, **When** the user submits the form, **Then** a toast error says `Place not found: "..."` and no route is drawn.
3. **Given** a GraphHopper API key, **When** a route is planned, **Then** the source badge shows "GraphHopper"; without a key it shows "OSRM/OSM".

---

### User Story 2 — Real-Time Weather + Cycling Conditions Score (Priority: P1)

After a route is found, the app fetches current weather at the starting point and displays: temperature, feels-like, wind, gusts, rain probability, humidity, UV index, precipitation. A score (0–100) summarises cycling suitability.

**Why this priority**: Tied to P1 — weather context is part of the core route-planning experience.

**Independent Test**: Route is planned. Weather block appears with temperature, score bar, and condition label. Score changes colour (green/amber/red) based on conditions.

**Acceptance Scenarios**:

1. **Given** a route is planned, **When** weather data loads, **Then** the panel shows all 6 weather cells and a filled score bar.
2. **Given** temperature below 0°C or thunderstorm code, **When** score is computed, **Then** score is below 40 and the bar is red.
3. **Given** clear sky and 18°C, **When** score is computed, **Then** score is above 70 and the bar is green.

---

### User Story 3 — Clothing Advisor (Priority: P2)

Based on weather data, the app recommends clothing for 5 body zones: Top, Legs, Hands, Feet, Head. Each recommendation is tagged (warm/cold/rain/fine) and shown in a 2-column grid. Extra alerts appear for rain, strong gusts, high UV, or icy conditions.

**Why this priority**: High added value with zero extra API calls — pure computation on existing weather data.

**Independent Test**: Plan any route. Clothing card appears below weather with 5 zones filled. Change season in test by stubbing wx.temp and verify recommendations change.

**Acceptance Scenarios**:

1. **Given** temperature < 0°C, **When** clothing is computed, **Then** all zones show cold-weather gear and ice alert appears.
2. **Given** precipitation probability > 35%, **When** clothing is computed, **Then** rain gear is recommended and mudguard alert appears.
3. **Given** UV index > 7, **When** clothing is computed, **Then** head zone recommends sunglasses and sunscreen alert appears.

---

### User Story 4 — Live Traffic Correlation (Priority: P2)

The app fetches car traffic flow at the route midpoint (TomTom API, optional key). It correlates car congestion with the bike route and flags shared road sections with colour-coded alerts. Without a TomTom key, a fallback message compares bike vs car route time.

**Why this priority**: Differentiates from basic route apps; demonstrates multi-tool orchestration pattern.

**Independent Test**: With TomTom key — a traffic strip appears after route planning with current/free-flow speed and congestion level. Without key — fallback strip shows car route comparison.

**Acceptance Scenarios**:

1. **Given** TomTom key and heavy congestion (ratio < 0.5), **When** route is planned, **Then** strip shows red badge "Heavy congestion" and a positive bike message.
2. **Given** TomTom key and free flow (ratio ≥ 0.8), **When** route is planned, **Then** strip shows green "Light traffic" message.
3. **Given** no TomTom key, **When** route is planned, **Then** fallback strip shows car vs bike time comparison.

---

### User Story 5 — Route Preferences (Priority: P3)

The user selects up to 5 toggleable chips: Safest, Fastest, Bike Lanes, Scenic, Avoid car traffic. These influence the GraphHopper vehicle profile (bike vs racingbike) and determine whether the car route overlay is shown.

**Why this priority**: Nice UX polish; GraphHopper vehicle profile is the only backend-visible effect.

**Independent Test**: Toggle "Fastest" on + "Safest" off → with GH key, route uses racingbike profile. Toggle "Avoid car traffic" off → dashed car route overlay disappears from map.

**Acceptance Scenarios**:

1. **Given** "Safest" chip is active and GH key is set, **When** route is planned, **Then** GH profile is `bike`.
2. **Given** "Fastest" chip is active and GH key is set, **When** route is planned, **Then** GH profile is `racingbike`.
3. **Given** "Avoid car traffic" is off, **When** route is rendered on map, **Then** no dashed car route overlay appears.

---

### Edge Cases

- What happens when both "Safest" and "Fastest" are active? → Safest takes precedence.
- What happens when the start and destination are the same? → OSRM returns a zero-distance route; show a toast warning.
- What happens if Open-Meteo is rate-limited? → Toast "Weather unavailable", route still displays.
- What happens if GraphHopper returns an error? → Falls back to OSRM automatically.
- What happens on a `file://` URL? → CORS may block fetches; README instructs to use `serve.sh`.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST geocode free-text addresses to coordinates using Nominatim (OSM).
- **FR-002**: System MUST fetch bicycle routes via GraphHopper (with key) or OSRM (fallback, no key).
- **FR-003**: System MUST fetch real-time weather via Open-Meteo with no API key required.
- **FR-004**: System MUST compute a cycling conditions score (0–100) from weather variables.
- **FR-005**: System MUST generate clothing recommendations for 5 body zones based on weather.
- **FR-006**: System MUST display the route as a polyline on a Leaflet map with OSM tiles.
- **FR-007**: System MUST show turn-by-turn instructions when available.
- **FR-008**: System SHOULD fetch live car traffic flow via TomTom when an API key is provided.
- **FR-009**: System MUST persist API keys in browser `localStorage` across sessions.
- **FR-010**: System MUST allow swapping start and destination with a single button.
- **FR-011**: All external API calls MUST have independent error handling with toast notifications.

### Key Entities

- **RouteResult**: `{ points, distanceM, durationS, instructions, ascent, descent, source }`
- **WeatherData**: `{ temp, feelsLike, precipProb, precip, windSpeed, windGust, windDir, humidity, code, uv }`
- **TrafficFlow**: `{ currentSpeed, freeFlowSpeed, ratio, level, label, emoji }`
- **Coordinate**: `{ lat, lng, name }`
- **ClothingItem**: `{ zone, rec, tag }`

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Route appears on the map within 5 seconds for any European city pair with internet.
- **SC-002**: Weather block loads within 2 seconds after route geocoding completes.
- **SC-003**: App is fully functional without any API keys (OSRM + Open-Meteo only).
- **SC-004**: App runs from `python3 -m http.server 8080` with no build step.
- **SC-005**: Each JS module is independently readable and testable in isolation.

---

## Assumptions

- Users have a modern browser (Chrome, Firefox, Edge, Safari — ES2020+).
- Internet access is required for all map tiles and API calls.
- Mobile support is a secondary concern; primary target is desktop viewport (≥860px).
- GraphHopper and TomTom free tiers (500/2500 req/day) are sufficient for personal use.
- The app has no backend; there is no user authentication.
