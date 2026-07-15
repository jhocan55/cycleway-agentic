# CycleWay — AI-assisted bicycle navigator

[![ci](https://github.com/jhocan55/cycleway-agentic/actions/workflows/ci.yml/badge.svg)](https://github.com/jhocan55/cycleway-agentic/actions/workflows/ci.yml)

A bicycle route planner (vanilla JS + Leaflet) with an **LLM copilot**: plan a ride,
get realistic bike ETAs, weather on the route, a safety score — and ask an AI advisor
questions about the trip. Built spec-first with [GitHub Spec Kit](specs/) as an
agentic-development practice project.

```
Browser (cycleway/)                         Backends
┌────────────────────────────┐
│ map.js / routing.js  ──────┼──► OSRM (routing, 15 km/h bike profile)
│ geocoding.js         ──────┼──► Nominatim
│ weather.js           ──────┼──► Open-Meteo
│ scoring.js (safety)        │
│ assistant.js ┐             │        ┌─────────────────────────────┐
│ safety-agent.js ───────────┼──────► │ LiteLLM proxy (docker)      │
└────────────────────────────┘        │  • local Ollama (llama3.2)  │
                                      │  • GitHub Models (gpt-4o-…) │
                                      │  → Langfuse traces          │
                                      └─────────────────────────────┘
```

## The AI part

- **Route advisor** ([`cycleway/js/assistant.js`](cycleway/js/assistant.js)) — chat about the planned route: clothing for the weather, pacing, where to stop
- **Safety agent** ([`cycleway/js/safety-agent.js`](cycleway/js/safety-agent.js)) — reviews the route and flags risk factors beyond the numeric safety score
- **Model-agnostic by design** ([`litellm-config.yaml`](litellm-config.yaml)) — one OpenAI-compatible endpoint in front of a free local Ollama model *and* GitHub Models; swap models without touching app code
- **Observability** — every LLM call traced to Langfuse (success and failure callbacks)

## Run it

```bash
# 1. LLM proxy (uses local Ollama; export GITHUB_TOKEN to also enable GitHub Models)
docker compose up -d

# 2. The app
cd cycleway && ./serve.sh     # or: python3 serve.py
# open http://localhost:8000
```

No build step, no framework — the front end is deliberately dependency-free ES modules.

## Spec-driven development

The feature was written spec-first: [`specs/001-cycleway-navigator/`](specs/001-cycleway-navigator/)
holds the specification, plan, and tasks that drove the implementation, and
[`.github/workflows/agent-check.yml`](.github/workflows/agent-check.yml) keeps the
agent guardrails honest in CI.
