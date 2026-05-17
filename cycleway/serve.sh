#!/usr/bin/env bash
# Serve CycleWay locally — required for ES modules (file:// blocks CORS)
cd "$(dirname "$0")"
PORT=${1:-8080}
echo "CycleWay running at http://localhost:$PORT/index.html"
echo "Press Ctrl+C to stop."
python3 -m http.server "$PORT"
