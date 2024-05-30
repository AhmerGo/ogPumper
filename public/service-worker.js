const CACHE_NAME = "my-app-cache-v1";
const QUEUE_NAME = "request-queue";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/bundle.js",
  "/static/js/0.chunk.js",
  "/static/js/main.chunk.js",
  "/static/js/vendors~main.chunk.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
  "/icons/logo192.png",
  "/icons/logo512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Ensures the service worker activates immediately
});

self.addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cacheResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              (networkResponse.type !== "basic" &&
                networkResponse.type !== "cors")
            ) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            return cacheResponse;
          });

        // Return cache response or network fetch if cache is not available
        return cacheResponse || fetchPromise;
      })
    );
  } else if (["POST", "DELETE", "PATCH"].includes(event.request.method)) {
    event.respondWith(
      fetch(event.request.clone()).catch(() => {
        return event.request
          .clone()
          .text()
          .then((body) => {
            return enqueueRequest(event.request, body).then(() => {
              return new Response(null, { status: 202, statusText: "Queued" });
            });
          });
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ensures the service worker takes control immediately
});

async function enqueueRequest(request, body) {
  const queuedRequest = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: body,
  };

  const cache = await caches.open(QUEUE_NAME);
  const id = new Date().toISOString();
  await cache.put(
    new Request(id, { method: "GET" }),
    new Response(JSON.stringify(queuedRequest))
  );
}

self.addEventListener("sync", (event) => {
  if (event.tag === "replay-queued-requests") {
    event.waitUntil(replayQueuedRequests());
  }
});

async function replayQueuedRequests() {
  const cache = await caches.open(QUEUE_NAME);
  const requests = await cache.keys();
  for (const request of requests) {
    const response = await cache.match(request);
    const queuedRequest = await response.json();
    const headers = new Headers(queuedRequest.headers);
    headers.set("Content-Type", "application/json");

    const fetchOptions = {
      method: queuedRequest.method,
      headers: headers,
      body: queuedRequest.body,
    };

    try {
      const networkResponse = await fetch(queuedRequest.url, fetchOptions);
      if (networkResponse.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error("Replay queued request failed", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 100)); // Delay before next request
  }
}

self.addEventListener("online", () => {
  self.registration.sync.register("replay-queued-requests");
});
