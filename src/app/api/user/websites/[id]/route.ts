import { NextResponse } from "next/server";
import { getDemoWebsiteById } from "../../../../../lib/user-websites-demo-data";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Single website for preview — swap for your backend: `GET /your-api/websites/:id`.
 */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const website = getDemoWebsiteById(id);
  if (!website) {
    return NextResponse.json({ message: "Website not found." }, { status: 404 });
  }
  return NextResponse.json({ website });
}
