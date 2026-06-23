import type { NextConfig } from "next";

import { MAX_UPLOAD_IMAGE_SIZE } from "./src/lib/upload-image";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: MAX_UPLOAD_IMAGE_SIZE,
    },
  },
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },

    ],
  },
};

export default nextConfig;
