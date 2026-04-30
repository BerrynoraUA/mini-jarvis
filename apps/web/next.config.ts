import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages are TypeScript source — let Next compile them.
  transpilePackages: [
    "@mini-jarvis/ui",
    "@mini-jarvis/config",
    "@mini-jarvis/schemas",
    "@mini-jarvis/storage",
  ],
};

export default nextConfig;
