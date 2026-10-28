import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@underworld/shared", "@underworld/game"],
  output: "standalone",
};

export default nextConfig;
