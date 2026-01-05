import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard production build without standalone complexity
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "pg"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore pg-native module (optional native binding for pg)
      config.externals.push("pg-native");
    }
    return config;
  },
};

export default nextConfig;
