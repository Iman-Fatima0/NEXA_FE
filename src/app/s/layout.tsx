import type { ReactNode } from "react";

/** Public published sites — no extra chrome; layout height follows page content. */
export default function PublicSiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
