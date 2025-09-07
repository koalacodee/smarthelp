import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  /* config options here */
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
