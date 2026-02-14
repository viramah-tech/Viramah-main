import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  /* Image Optimization for Vercel */
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  /* Compression and Performance */
  compress: true,
  
  /* Production Source Maps */
  productionBrowserSourceMaps: false,
};

export default nextConfig;
