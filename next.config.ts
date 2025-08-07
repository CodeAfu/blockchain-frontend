import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  webpack: config => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    // https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tan-imperial-gecko-849.mypinata.cloud",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
