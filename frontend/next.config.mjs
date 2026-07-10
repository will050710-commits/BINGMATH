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
};

export default nextConfig;
