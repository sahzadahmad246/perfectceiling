import type { NextConfig } from "next";

const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
} satisfies NextConfig;

export default config;
