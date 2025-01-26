import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  output: 'export',
  // If you have any static pages that require dynamic data,
  // you might need to specify them here
  trailingSlash: true,
  
};

export default nextConfig;
