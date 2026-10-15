import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@underworld/shared"],
  output: "standalone",
};

export default nextConfig;
