import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },

      // AWS S3 direct access
      {
        protocol: "https",
        hostname: "avacasa-images.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // CloudFront configuration can be added here later if needed
    ],
  },
  /* config options here */
};

export default nextConfig;
