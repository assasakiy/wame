import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Arena exposes the dev server through an e2b.app origin. Allow its HMR
  // requests so the live preview can navigate and refresh normally.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
