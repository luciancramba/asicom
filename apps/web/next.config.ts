import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the shared TS package directly (single source of truth for the field-map).
  transpilePackages: ["@asicom/shared"],
  // Native module — don't bundle it into the server build.
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    // Up to 5 phone photos per dosar exceed the 1 MB default for Server Action bodies.
    serverActions: { bodySizeLimit: "30mb" },
  },
};

export default nextConfig;
