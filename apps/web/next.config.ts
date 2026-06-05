import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the shared TS package directly (single source of truth for the field-map).
  transpilePackages: ["@asicom/shared"],
  // Native module — don't bundle it into the server build.
  serverExternalPackages: ["better-sqlite3"],
  // Allow `next dev` to serve HMR + dev resources when reached via a tunnel host
  // (Cloudflare Quick Tunnels for early Tripon previews). Without this, the dev
  // server blocks cross-origin reads from the tunnel and the page can render but
  // Server Action POSTs (upload, processDosar) silently fail.
  allowedDevOrigins: ["*.trycloudflare.com", "*.cramba.ro"],
  experimental: {
    // Up to 6 phone photos per dosar exceed the 1 MB default for Server Action bodies.
    serverActions: {
      bodySizeLimit: "30mb",
      // Same reason as allowedDevOrigins — the Server Action origin check rejects
      // POSTs whose Origin header doesn't match the configured host.
      allowedOrigins: ["*.trycloudflare.com", "*.cramba.ro"],
    },
  },
};

export default nextConfig;
