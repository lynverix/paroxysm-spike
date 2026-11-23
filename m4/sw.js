// paroxysm m4 spike worker (throwaway): serves app.html as text/html, answers pings and a proxy-style path
const BORN = Date.now();
const SCOPE = new URL(self.registration.scope).pathname;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("message", e => {
    if (e.data?.type !== "ping") return;
    e.source.postMessage({ type: "pong", id: e.data.id, born: BORN, scope: self.registration.scope });
});

const html = (body, status = 200) => new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
});

self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);
    if (url.origin !== location.origin || !url.pathname.startsWith(SCOPE)) return;
    const rel = url.pathname.slice(SCOPE.length);
    if (rel === "app.html") e.respondWith(fetch(url.origin + url.pathname, { cache: "no-store" }).then(async r => html(await r.text(), r.status)));
    else if (rel.startsWith("~/sj/")) e.respondWith(html("<!doctype html><title>sj</title><body>prefix-ok born=" + BORN + " " + rel.replace(/[<&]/g, "")));
    else if (rel === "born") e.respondWith(new Response(JSON.stringify({ born: BORN }), { headers: { "content-type": "application/json", "cache-control": "no-store" } }));
});
