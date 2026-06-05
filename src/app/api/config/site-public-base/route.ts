import { NextResponse } from "next/server";
import { resolveSitePublicOrigin } from "../../../../lib/site-public-base.server";

/** Dev: localhost origin for published site links. */
export async function GET() {
  const origin = resolveSitePublicOrigin();
  return NextResponse.json(
    {
      origin,
      port: process.env.PORT?.trim() || "3001",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
