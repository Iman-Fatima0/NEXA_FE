import { NextResponse } from "next/server";
import { getDemoIntegrations } from "../../../../lib/user-integrations-demo-data";
import type { UserIntegrationsPayload } from "../../../../lib/user-integrations-types";

/** Replace with your backend: return each integration with optional previews / highlight / href. */
export async function GET() {
  const payload: UserIntegrationsPayload = { integrations: getDemoIntegrations() };
  return NextResponse.json(payload);
}
