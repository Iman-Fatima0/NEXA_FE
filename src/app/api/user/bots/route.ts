import { NextResponse } from "next/server";
import { getDemoBots } from "../../../../lib/user-bots-demo-data";
import type { UserBotsPayload } from "../../../../lib/user-bots-types";

/** Replace with your backend: return each bot with optional previewUrl / previewHtml / highlight / href. */
export async function GET() {
  const payload: UserBotsPayload = { bots: getDemoBots() };
  return NextResponse.json(payload);
}
