import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages are TypeScript source — let Next compile them.
  // Also include ESM-only packages that cause SSR async module issues with Turbopack.
  transpilePackages: [
    "@mini-jarvis/ui",
    "@mini-jarvis/config",
    "@mini-jarvis/schemas",
    "@mini-jarvis/storage",
    "@tanstack/react-query",
    "@tanstack/query-core",
    "sonner",
  ],
};

export default nextConfig;
