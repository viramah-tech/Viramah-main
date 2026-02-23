import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // NOTE: Do NOT set output:'standalone' — breaks AWS Amplify SSR compute

  /*
   * ── Server-side env vars for Amplify Gen 1 ──────────────────────────
   * Amplify Gen 1 SSR Lambdas don't auto-inject Console env vars at runtime.
   * Using next.config `env` reads them at BUILD time (when Amplify vars ARE
   * available) and embeds them into the server bundle — same as NEXT_PUBLIC_*.
   * These are server-only so they are NOT exposed to the browser.
   */
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "",
    GOOGLE_SHEET_WEBHOOK_URL: process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "",
  },

  /* Image Optimization for Vercel */
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75, 85, 95],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  /* Compression and Performance */
  compress: true,

  /* Production Source Maps */
  productionBrowserSourceMaps: false,

  /* Allow build to succeed despite type errors in non-critical areas */
  typescript: {
    ignoreBuildErrors: false,
  },

  /* Security Headers */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/(.*)\\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
