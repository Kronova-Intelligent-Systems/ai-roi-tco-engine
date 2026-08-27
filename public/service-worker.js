const CACHE_NAME = "kronova-roi-v1"
const RUNTIME_CACHE = "kronova-runtime-v1"
const API_CACHE = "kronova-api-v1"

// Assets to cache on install
const PRECACHE_URLS = ["/", "/offline", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Pre-caching offline page")
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
              console.log("[ServiceWorker] Removing old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - network first with cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return (
              response ||
              new Response(JSON.stringify({ error: "Offline", cached: true }), {
                headers: { "Content-Type": "application/json" },
              })
            )
          })
        }),
    )
    return
  }

  // HTML pages - network first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match("/offline")
          })
        }),
    )
    return
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        const responseToCache = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync:", event.tag)

  if (event.tag === "sync-roi-calculations") {
    event.waitUntil(syncROICalculations())
  }
})

async function syncROICalculations() {
  const cache = await caches.open(API_CACHE)
  const requests = await cache.keys()

  for (const request of requests) {
    if (request.url.includes("/api/roi-calculate")) {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch (error) {
        console.error("[ServiceWorker] Sync failed:", error)
      }
    }
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push received")

  const options = {
    body: event.data ? event.data.text() : "New update available",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    vibrate: [200, 100, 200],
    tag: "roi-notification",
    requireInteraction: false,
    actions: [
      { action: "open", title: "Open App" },
      { action: "close", title: "Close" },
    ],
  }

  event.waitUntil(self.registration.showNotification("Kronova ROI Calculator", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification click:", event.action)

  event.notification.close()

  if (event.action === "open") {
    event.waitUntil(clients.openWindow("/"))
  }
})

// Message handler for client communication
self.addEventListener("message", (event) => {
  console.log("[ServiceWorker] Message received:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }),
    )
  }
})
