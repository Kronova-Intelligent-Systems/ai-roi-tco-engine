"use client"

export function registerServiceWorker() {
  if (typeof window === "undefined") return

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js", {
          scope: "/",
        })

        console.log("[PWA] Service Worker registered:", registration)

        // Check for updates every hour
        setInterval(
          () => {
            registration.update()
          },
          60 * 60 * 1000,
        )

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm("New version available! Reload to update?")) {
                newWorker.postMessage({ type: "SKIP_WAITING" })
                window.location.reload()
              }
            }
          })
        })

        // Handle controller change
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload()
        })
      } catch (error) {
        console.error("[PWA] Service Worker registration failed:", error)
      }
    })
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }
  return Notification.permission === "granted"
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[PWA] Push notifications not supported")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    return subscription
  } catch (error) {
    console.error("[PWA] Push subscription failed:", error)
    return null
  }
}

// Check if app is installed
export function isAppInstalled() {
  if (typeof window === "undefined") return false

  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

// Prompt to install app
export function setupInstallPrompt() {
  if (typeof window === "undefined") return

  let deferredPrompt: any = null

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPrompt = e

    // Show custom install UI
    const installBanner = document.getElementById("install-banner")
    if (installBanner) {
      installBanner.style.display = "block"
    }
  })

  // Handle install button click
  window.addEventListener("appinstalled", () => {
    console.log("[PWA] App installed successfully")
    deferredPrompt = null

    const installBanner = document.getElementById("install-banner")
    if (installBanner) {
      installBanner.style.display = "none"
    }
  })

  return {
    showInstallPrompt: async () => {
      if (!deferredPrompt) {
        return false
      }

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log("[PWA] Install prompt outcome:", outcome)

      deferredPrompt = null
      return outcome === "accepted"
    },
  }
}

// Background sync for offline data
export async function registerBackgroundSync(tag: string) {
  if (!("serviceWorker" in navigator) || !("sync" in ServiceWorkerRegistration.prototype)) {
    console.warn("[PWA] Background sync not supported")
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(tag)
    console.log("[PWA] Background sync registered:", tag)
    return true
  } catch (error) {
    console.error("[PWA] Background sync failed:", error)
    return false
  }
}
