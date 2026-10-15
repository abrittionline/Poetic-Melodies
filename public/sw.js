const CACHE = "poetic-melodies-v1";
const SHELL = [
  "/",
  "/poetry",
  "/audio",
  "/video",
  "/series",
  "/albums",
  "/about",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/media/morning.wav",
  "/media/river.mp4",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("poetic-melodies-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const req = event.request,
    url = new URL(req.url);
  if (
    req.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/admin") ||
    req.headers.get("rsc") ||
    url.searchParams.has("_rsc")
  )
    return;
  if (req.headers.has("range")) {
    event.respondWith(
      caches.match(url.pathname).then(async (cached) => {
        if (!cached) return fetch(req);
        const buffer = await cached.arrayBuffer();
        const match = /bytes=(\d+)-(\d*)/.exec(req.headers.get("range") || "");
        if (!match) return cached;
        const start = Number(match[1]),
          end = match[2] ? Number(match[2]) : buffer.byteLength - 1;
        if (start > end || start >= buffer.byteLength)
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${buffer.byteLength}` },
          });
        const last = Math.min(end, buffer.byteLength - 1);
        return new Response(buffer.slice(start, last + 1), {
          status: 206,
          headers: {
            "Content-Type": cached.headers.get("Content-Type") || "audio/wav",
            "Content-Range": `bytes ${start}-${last}/${buffer.byteLength}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(last - start + 1),
          },
        });
      }),
    );
    return;
  }
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          event.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate")
          return (await caches.match("/")) || Response.error();
        return Response.error();
      }),
  );
});
