const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const isProduction = process.env.NODE_ENV === "production"
const remotePatterns = []

let supabaseHost = ""

if (supabaseUrl) {
  try {
    const { host } = new URL(supabaseUrl)
    supabaseHost = host
    remotePatterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    })
  } catch {
    // Ignore malformed URLs so local development can proceed.
  }
}

const analyticsEndpoint = "https://vitals.vercel-insights.com"
const googleTagManager = "https://www.googletagmanager.com"
const googleAnalytics = "https://www.google-analytics.com"
const googleDoubleClick = "https://stats.g.doubleclick.net"

const directiveValues = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "object-src": ["'none'"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "script-src": ["'self'", "'unsafe-inline'", analyticsEndpoint, googleTagManager],
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'", analyticsEndpoint, googleTagManager, googleAnalytics, googleDoubleClick],
  "img-src": ["'self'", "data:", "blob:", googleAnalytics, googleDoubleClick],
  "media-src": ["'self'"],
}

if (supabaseHost) {
  const supabaseOrigin = `https://${supabaseHost}`
  directiveValues["connect-src"].push(supabaseOrigin)
  directiveValues["img-src"].push(supabaseOrigin)
  directiveValues["media-src"].push(supabaseOrigin)
}

if (!isProduction) {
  const localOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "ws://localhost:3000",
    "ws://127.0.0.1:3000",
  ]
  directiveValues["connect-src"].push(...localOrigins)
  directiveValues["script-src"].push("'unsafe-eval'")
}

const cspExtra = []
if (isProduction) {
  cspExtra.push("upgrade-insecure-requests")
}

const cspDirectives = [
  ...Object.entries(directiveValues).map(([key, values]) => `${key} ${Array.from(new Set(values)).join(" ")};`),
  ...cspExtra.map((value) => `${value};`),
].join(" ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.replace(/\s{2,}/g, " ").trim() },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
]

if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
