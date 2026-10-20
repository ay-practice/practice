// Receives PDFs shared into Cardiology CPD or Respiratory CPD from Android's Share menu.
// It only handles that one request; everything else goes to the network as normal.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "POST" || !u.searchParams.has("share")) return;
  e.respondWith((async () => {
    const app = /copd\.html$/.test(u.pathname) ? "r" : "j";
    try {
      const fd = await e.request.formData();
      const f = fd.get("pdf") || [...fd.values()].find(v => v && typeof v === "object" && "size" in v);
      if (f) {
        const c = await caches.open("cpd-share-inbox");
        await c.put(new URL(`__shared-${app}.pdf`, u).href, new Response(f, { headers: { "Content-Type": "application/pdf", "X-Name": encodeURIComponent(f.name || "Shared.pdf") } }));
      }
    } catch (err) {}
    return Response.redirect(u.pathname + "?shared=1", 303);
  })());
});
