import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // Add your backend domain here for image loading
  },
  // Enable server actions for form submissions
  experimental: {
    serverActions: {},
  }
};

export default nextConfig;
