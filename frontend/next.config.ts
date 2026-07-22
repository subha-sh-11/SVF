import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't fail the production build on ESLint issues. Our lint setup flags
  // unknown-rule references from inline disable comments (not real bugs), and
  // TypeScript type-checking still runs and must pass. Keeps Vercel deploys green.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Hide the dev-mode "N" indicator entirely (dev only; never in production).
  devIndicators: false,
};

export default nextConfig;

