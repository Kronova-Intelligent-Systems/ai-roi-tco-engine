/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: true,
    // Disables the specific caching thread that causes the bmi2 CPU panic
    turbopackFileSystemCacheForDev: false,
  },
  // Tells Next.js and Turbopack to skip bundling jsPDF for the server,
  // resolving the Node.js worker_threads crash during SSR.
  serverExternalPackages: ['jspdf'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  images: {
    domains: ['quantumone.b-cdn.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quantumone.b-cdn.net',
        pathname: '/kronova/**',
      },
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // DNS Prefetching - Enable for faster DNS lookups
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // HSTS - Force HTTPS for 2 years including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Prevent clickjacking - Allow same origin framing only
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection (legacy but still useful for older browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer Policy - Balanced security and functionality
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy - Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), serial=()'
          },
          // Cross-Origin Policies for enhanced security
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site'
          },
          // Content Security Policy - Comprehensive protection
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: Only load resources from same origin
              "default-src 'self'",
              // Scripts: Allow self, inline scripts (for Next.js), eval (for PDF generation), and Vercel analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
              // Styles: Allow self and inline styles (required for Tailwind/styled-jsx)
              "style-src 'self' 'unsafe-inline'",
              // Images: Allow self, data URIs, HTTPS, and blob (for generated images/PDFs)
              "img-src 'self' data: https: blob:",
              // Fonts: Allow self and data URIs (for custom fonts)
              "font-src 'self' data:",
              // Connections: Allow Supabase, Vercel, Resend, and your own domains
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://va.vercel-scripts.com https://*.resend.com https://*.kronova.io https://registry.npmjs.org",
              // Prevent framing by other sites
              "frame-ancestors 'self'",
              // Base URI restriction
              "base-uri 'self'",
              // Form actions - only allow same origin
              "form-action 'self'",
              // Frames: Allow self and Vercel Live
              "frame-src 'self' https://vercel.live",
              // Web Workers and Service Workers
              "worker-src 'self' blob:",
              // Manifest
              "manifest-src 'self'",
              // Object/Embed restrictions
              "object-src 'none'",
              // Media sources
              "media-src 'self'",
              // Child sources (deprecated but included for older browsers)
              "child-src 'self' blob:",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join('; ')
          }
        ],
      },
      // API Routes - More relaxed CSP for JSON responses
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },

}

export default nextConfig
