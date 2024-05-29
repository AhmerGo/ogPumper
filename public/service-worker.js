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
});

self.addEventListener("fetch", (event) => {
  const req = event.request.method;
  if (event.request.method === "GET") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            (response.type !== "basic" && response.type !== "cors")
          ) {
            return caches.match(event.request).then((cacheResponse) => {
              return cacheResponse || response;
            });
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Use cache only when offline
          if (!navigator.onLine) {
            return caches.match(event.request);
          }
        })
    );
  } else if (req === "POST" || req === "DELETE" || req === "PATCH") {
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
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

async function enqueueRequest(request, body) {
  const queuedRequest = {
    url: request.url, // Store the original URL
    method: request.method,
    headers: [...request.headers.entries()],
    body: body,
  };

  const cache = await caches.open(QUEUE_NAME);
  const id = new Date().toISOString();
  await cache.put(
    new Request(`${id}`, { method: "GET" }), // Use the unique identifier as the key
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
  console.log("Replaying queued requests:", requests); // Debugging line

  for (const request of requests) {
    const response = await cache.match(request);
    const queuedRequest = await response.json();

    // Log the queued request for debugging
    console.log("Queued request:", queuedRequest);

    // Ensure the headers are correctly set
    const headers = new Headers(queuedRequest.headers);
    headers.set("Content-Type", "application/json");

    const fetchOptions = {
      method: queuedRequest.method,
      headers: headers,
      body: queuedRequest.body, // Convert body to string
    };

    // Log fetch options for debugging
    console.log("Fetch options:", fetchOptions);

    try {
      const networkResponse = await fetch(queuedRequest.url, fetchOptions); // Use the original URL

      // Log the network response for debugging
      console.log("Network response:", networkResponse);

      // Check if the response is not ok and log the response body
      if (!networkResponse.ok) {
        const errorBody = await networkResponse.text();
        console.error("Network response was not ok:", networkResponse);
        console.error("Response body:", errorBody);
      } else {
        console.log(
          "Request sent successfully, removing from queue:",
          queuedRequest.url
        ); // Debugging line
        await cache.delete(request);
      }
    } catch (error) {
      console.error("Replay queued request failed", error);
    }

    // Introduce a 100 ms delay before sending the next request
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
self.addEventListener("online", () => {
  self.registration.sync.register("replay-queued-requests");
});
