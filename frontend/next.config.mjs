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

  // ── Phase 1 security hardening (audit report §Phase 1) ─────────────────────
  // Baseline headers plus a Content-Security-Policy shipped in REPORT-ONLY mode
  // so it can never break the app while violations are collected; rename the key
  // to "Content-Security-Policy" to enforce it once the reports are clean.
  async headers() {
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
      "connect-src 'self' https://duomath.onrender.com https://*.googleapis.com https://*.firebaseio.com wss://*.onrender.com",
      "font-src 'self' data:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: csp },
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
