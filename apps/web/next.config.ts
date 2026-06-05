import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the shared TS package directly (single source of truth for the field-map).
  transpilePackages: ["@issuedoc/shared"],
};

export default nextConfig;
