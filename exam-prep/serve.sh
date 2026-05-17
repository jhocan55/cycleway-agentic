#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT=${1:-8090}
echo "Exam Prep running at http://localhost:$PORT/index.html"
echo "Make sure Ollama is running: ollama serve"
echo "Press Ctrl+C to stop."
python3 -m http.server "$PORT"
