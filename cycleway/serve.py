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

import socket

def _lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return 'unknown'

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
lan  = _lan_ip()
print(f'CycleWay running at:')
print(f'  Local   → http://localhost:{port}/')
print(f'  Network → http://{lan}:{port}/   ← open this on your phone')
print('Press Ctrl+C to stop.')
HTTPServer(('', port), NoCacheHandler).serve_forever()
