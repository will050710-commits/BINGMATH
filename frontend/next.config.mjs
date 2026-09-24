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
  async headers() {
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
      "connect-src 'self' https://duomath.onrender.com https://duosteam-api.onrender.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.cloudfunctions.net",
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
    ];
  },
};

export default nextConfig;
