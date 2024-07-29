importScripts("/idb.js");

const CACHE_NAME = "my-app-cache-v1.1.1"; // Updated cache name with version
const DB_NAME = "request-queue";
const STORE_NAME = "requests";

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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Force the SW to take control immediately
});

self.addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      (async () => {
        if (!navigator.onLine) {
          const cacheResponse = await caches.match(event.request);
          return cacheResponse || fetch(event.request);
        } else {
          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              const cache = await caches.open(CACHE_NAME);
              cache.put(event.request, responseToCache);
            }
            return networkResponse;
          } catch (error) {
            const cacheResponse = await caches.match(event.request);
            return cacheResponse;
          }
        }
      })()
    );
  } else if (["POST", "DELETE", "PATCH"].includes(event.request.method)) {
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        const body = await event.request.clone().text();
        await enqueueRequest(event.request, body);
        return new Response(null, { status: 202, statusText: "Accepted" });
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

async function enqueueRequest(request, body) {
  const db = await idb.openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });

  const queuedRequest = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: body,
  };

  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).add(queuedRequest);
  await tx.done;

  if ("sync" in self.registration) {
    self.registration.sync.register("replay-queued-requests");
  } else {
    setTimeout(replayQueuedRequests, 5000); // Delay to avoid immediate reprocessing
  }
}

self.addEventListener("sync", (event) => {
  if (event.tag === "replay-queued-requests") {
    event.waitUntil(replayQueuedRequests());
  }
});

async function replayQueuedRequests() {
  const db = await idb.openDB(DB_NAME, 1);
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const requests = await store.getAll();

  for (const queuedRequest of requests) {
    const headers = new Headers(queuedRequest.headers);
    if (queuedRequest.body) {
      headers.set("Content-Type", "application/json");
    }

    const fetchOptions = {
      method: queuedRequest.method,
      headers: headers,
      body: queuedRequest.body,
    };

    try {
      const networkResponse = await fetch(queuedRequest.url, fetchOptions);
      if (networkResponse.ok) {
        const txDelete = db.transaction(STORE_NAME, "readwrite");
        await txDelete.objectStore(STORE_NAME).delete(queuedRequest.id);
        await txDelete.done;
      }
    } catch (error) {
      console.error("Replay queued request failed", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
