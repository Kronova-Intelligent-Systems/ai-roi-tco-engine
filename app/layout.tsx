import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { PWAInstallBanner } from "@/components/pwa-install-banner"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Kronova - AI ROI Calculator",
  description:
    "Calculate your AI transformation ROI with comprehensive analysis and industry benchmarks. Powered by Kronova Intelligent Systems.",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: [
    "AI ROI calculator",
    "AI transformation",
    "ROI analysis",
    "industry benchmarks",
    "Kronova",
    "intelligent systems",
  ],
  authors: [{ name: "Kronova" }],
  creator: "Kronova",
  metadataBase: new URL("https://roi.kronova.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://roi.kronova.io",
    title: "Kronova - AI ROI Calculator",
    description: "Calculate your AI transformation ROI with comprehensive analysis and industry benchmarks",
    siteName: "Kronova",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kronova - AI ROI Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kronova - AI ROI Calculator",
    description: "Calculate your AI transformation ROI with comprehensive analysis and industry benchmarks",
    creator: "@kronova_io",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: "Kronova ROI Calculator",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kronova ROI",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash-1668-2388.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash-1536-2048.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0047AB" },
    { media: "(prefers-color-scheme: dark)", color: "#00CED1" },
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#0047AB",
    "msapplication-tap-highlight": "no",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0047AB" />
      </head>
      <body>
        <Suspense fallback={null}>
          {children}
          <CookieConsentBanner />
          <PWAInstallBanner />
          <Analytics />
          <SpeedInsights />
        </Suspense>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('[PWA] Service Worker registered:', reg))
                    .catch(err => console.error('[PWA] Service Worker registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
