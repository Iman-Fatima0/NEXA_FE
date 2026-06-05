const DEV_PORT = process.env.PORT?.trim() || "3001";

/** Public site links use localhost only for now. */
export function resolveSitePublicOrigin(): string {
  const envRaw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.AUTH_URL?.trim() || "";
  if (envRaw) {
    try {
      const u = new URL(envRaw.includes("://") ? envRaw : `http://${envRaw}`);
      const h = u.hostname.toLowerCase();
      if (h === "localhost" || h === "127.0.0.1") {
        return `${u.protocol}//${u.host}`;
      }
    } catch {
      /* fall through */
    }
  }
  return `http://localhost:${DEV_PORT}`;
}
