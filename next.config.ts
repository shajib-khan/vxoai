import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // optional but helps with that turbopack root warning:
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
