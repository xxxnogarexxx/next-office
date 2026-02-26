import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://images.unsplash.com https://images.ctfassets.net https://api.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com",
            "connect-src 'self' https://*.supabase.co https://api.mapbox.com https://tiles.mapbox.com https://events.mapbox.com https://overpass-api.de https://www.google-analytics.com https://googleads.g.doubleclick.net https://region1.google-analytics.com",
            "font-src 'self' https://fonts.gstatic.com",
            "worker-src 'self' blob:",
            "frame-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
        },
      ],
    },
  ],
};

export default withSentryConfig(nextConfig, {
  // Upload source maps to Sentry for readable stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps during build (not dev)
  silent: !process.env.CI,

  // Delete source maps after upload (don't expose to browser)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Tunnel Sentry events through the app to avoid ad blockers
  tunnelRoute: "/monitoring",

  // Disable Sentry telemetry
  disableLogger: true,

  // Automatically instrument API routes and server components
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
});
