import { NextResponse } from "next/server";
import { getDemoWebsites } from "../../../../lib/user-websites-demo-data";
import type { UserWebsitesPayload } from "../../../../lib/user-websites-types";

/**
 * Placeholder until your backend is wired: replace this handler with a proxy
 * to your API and map the payload to `UserWebsitesPayload`.
 */
export async function GET() {
  const payload: UserWebsitesPayload = { websites: getDemoWebsites() };
  return NextResponse.json(payload);
}
