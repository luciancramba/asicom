import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the shared TS package directly (single source of truth for the field-map).
  transpilePackages: ["@asicom/shared"],
  // Native module — don't bundle it into the server build.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
