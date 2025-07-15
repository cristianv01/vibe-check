import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vibecheck-s3-images.s3.amazonaws.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "vibecheck-s3-images.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
