import { NextResponse } from "next/server";
import { getDemoIntegrationById } from "../../../../../lib/user-integrations-demo-data";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const integration = getDemoIntegrationById(id);
  if (!integration) {
    return NextResponse.json({ message: "Integration not found." }, { status: 404 });
  }
  return NextResponse.json({ integration });
}
