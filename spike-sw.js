// paroxysm milestone 0 spike: THROWAWAY. Answers feasibility questions only.
// Contains no proxy code and no virtualization logic.
const VERSION = "spike-1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

// Capability probes, run on request from the page (i.e. AFTER install).
self.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "probe") return;
  const r = { version: VERSION, scope: self.registration.scope };
  try { r.newFunction = new Function("return 40 + 2")() === 42 ? "allowed" : "wrong result"; }
  catch (err) { r.newFunction = "blocked: " + err.name + ": " + err.message; }
  try { r.indirectEval = (0, eval)("1 + 1") === 2 ? "allowed" : "wrong result"; }
  catch (err) { r.indirectEval = "blocked: " + err.name + ": " + err.message; }
  try { importScripts("spike-extra.js"); r.importScriptsAfterInstall = "allowed"; }
  catch (err) { r.importScriptsAfterInstall = "blocked: " + err.name + ": " + err.message; }
  e.source.postMessage({ type: "probe-result", result: r });
});

// Synthesised responses: prove the SW can answer in-scope navigations with text/html,
// including a proxy-style path containing "~/sj/" and a nested "https://".
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return;
  const rel = url.pathname.slice(scopePath.length);

  if (rel === "virtual.html") {
    e.respondWith(html(
      "<!doctype html><meta charset=utf-8><title>virtual.html</title>" +
      "<body style='font:14px monospace;background:#000;color:#ddd;padding:24px'>" +
      "<h3>virtual.html (synthesised by the service worker)</h3><pre id=o></pre>" +
      "<p><a style='color:#8cf' href='./index.svg'>back to index.svg</a></p>" +
      "<script>document.getElementById('o').textContent=JSON.stringify({" +
      "contentType:document.contentType,href:location.href,isSecureContext," +
      "controlled:!!navigator.serviceWorker.controller},null,2)</script>"
    ));
  } else if (rel.startsWith("~/sj/")) {
    e.respondWith(html("<!doctype html><body>prefix-ok:" + rel.replace(/</g, "&lt;")));
  }
});
