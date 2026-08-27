"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if already installed
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    if (isInstalled) {
      return
    }

    // Check if user dismissed banner
    const dismissed = localStorage.getItem("pwa-banner-dismissed")
    if (dismissed) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[PWA] Install outcome:", outcome)

    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem("pwa-banner-dismissed", "true")
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <Card className="p-4 shadow-lg border-[#0047AB]/30 bg-white/95 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="bg-[#0047AB]/10 p-2 rounded-lg">
                <Download className="h-5 w-5 text-[#0047AB]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Install Kronova ROI Calculator</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get quick access to the ROI calculator with offline support
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleInstall} size="sm" className="bg-[#0047AB] hover:bg-[#003d91]">
                    Install
                  </Button>
                  <Button onClick={handleDismiss} size="sm" variant="outline">
                    Not now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
