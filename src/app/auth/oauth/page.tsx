"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BFF_PATHS } from "../../../lib/api/bff-paths";

function OAuthCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const code = searchParams.get("code")?.trim();
    if (!code) {
      router.replace("/login?oauth_error=missing_code");
      return;
    }

    void (async () => {
      try {
        const res = await fetch(BFF_PATHS.authOAuthExchange, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ code }),
        });
        if (!res.ok) {
          let err = "OAuth sign-in failed";
          try {
            const data = (await res.json()) as { message?: string };
            if (data.message) err = data.message;
          } catch {
            /* ignore */
          }
          router.replace(`/login?oauth_error=${encodeURIComponent(err)}`);
          return;
        }
        router.replace("/dashboard");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Network error");
        router.replace("/login?oauth_error=network");
      }
    })();
  }, [searchParams, router]);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <p>{message}</p>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem" }}>Loading…</p>}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
