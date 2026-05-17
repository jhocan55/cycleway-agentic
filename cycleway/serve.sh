#!/usr/bin/env bash
# Serve CycleWay locally — required for ES modules (file:// blocks CORS)
# Uses serve.py which adds Cache-Control: no-cache so stale JS is never an issue
cd "$(dirname "$0")"
PORT=${1:-8080}
python3 serve.py "$PORT"
