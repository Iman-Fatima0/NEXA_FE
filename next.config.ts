import type { NextConfig } from "next";
import path from "node:path";

/** Next.js 16 blocks LAN dev/HMR unless host is listed (with port). */
function collectAllowedDevOrigins(): string[] {
  const out = new Set<string>(["localhost:3001", "127.0.0.1:3001"]);
  for (const v of [process.env.NEXT_PUBLIC_APP_URL, process.env.AUTH_URL]) {
    const raw = v?.trim();
    if (!raw) continue;
    try {
      const u = new URL(raw.includes("://") ? raw : `http://${raw}`);
      out.add(u.host);
    } catch {
      /* ignore malformed */
    }
  }
  return [...out];
}

const backendBase =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL?.trim().replace(/\/+$/, "") ||
  "http://localhost:3000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: collectAllowedDevOrigins(),
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
