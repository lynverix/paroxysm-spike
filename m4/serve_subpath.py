# serves a folder under a subpath like jsDelivr does: python serve_subpath.py <folder> [port] [prefix]
import http.server
import os
import sys

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
prefix = sys.argv[3] if len(sys.argv) > 3 else "/gh/paroxysm@dev/"


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".svg": "image/svg+xml", ".wasm": "application/wasm", ".mjs": "text/javascript", ".js": "text/javascript"}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=root, **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if path + "/" == prefix:
            self.send_response(301)
            self.send_header("Location", prefix)
            self.end_headers()
            return None
        if not path.startswith(prefix):
            return self.not_found()
        local = "/" + self.path[len(prefix):]
        if not os.path.exists(self.translate_path(local)):
            return self.not_found()
        self.path = local
        return super().send_head()

    # same 404 text as VS Code Live Server
    def not_found(self):
        body = ("Cannot GET " + self.path.split("?", 1)[0]).encode()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


print(f"serving {root} at http://localhost:{port}{prefix}")
http.server.ThreadingHTTPServer(("localhost", port), Handler).serve_forever()
