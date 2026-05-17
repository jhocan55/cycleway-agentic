#!/usr/bin/env python3
"""Dev server with Cache-Control: no-cache — prevents stale-JS bugs during development."""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # suppress per-request noise

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
print(f'CycleWay running at http://localhost:{port}/')
print('Press Ctrl+C to stop.')
HTTPServer(('', port), NoCacheHandler).serve_forever()
