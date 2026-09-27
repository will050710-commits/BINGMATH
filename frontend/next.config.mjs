/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Compress responses with gzip
  compress: true,

  // Tree-shake large libraries — only bundle what's actually imported
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@heroui/react",
      "katex",
      "@heroicons/react",
    ],
  },

  // Image optimization settings
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ── Phase 2 security hardening: enforced Content-Security-Policy ───────────
  // The policy was shipped in report-only mode during Phase 1; it is now
  // enforced. Hosts come from a scan of every external URL in frontend/src
  // (YouTube iframe API + embeds, Firebase Auth tokens/frames, Google fonts,
  // GeoGebra/Desmos embeds, the Render API). If something is blocked in
  // production, revert the key to "Content-Security-Policy-Report-Only" while
  // the missing host is added — the rest of the hardening is unaffected.
  //
  // 2026-09-27: connect-src is now built below so that localhost:8000 is only
  // allowed by `next dev`. A stale localhost fallback in the bundle made a
  // blocked request look like a CSP bug in production — see src/lib/apiBase.js
  // and scripts/check-api-base.mjs.
  async headers() {
    // `next dev` talks to the FastAPI server on :8000; a deployed build never
    // does (apiBase.js resolves the Render host from the hostname).
    const isProd = process.env.NODE_ENV === "production";
    const connectSrc = [
      "'self'",
      "https://duomath.onrender.com",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "wss://*.firebaseio.com",
      "https://*.cloudfunctions.net",
      // Removed 2026-09-27: https://duosteam-api.onrender.com answers 404 for
      // every /api route and no client calls it any more.
      ...(isProd ? [] : ["http://localhost:8000", "http://127.0.0.1:8000"]),
    ].join(" ");

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com https://apis.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      `connect-src ${connectSrc}`,
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://www.geogebra.org https://www.desmos.com",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        // Serve the PWA manifest with its own MIME type (Chrome logs a manifest
        // warning when it arrives as generic application/json).
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

export default nextConfig;
