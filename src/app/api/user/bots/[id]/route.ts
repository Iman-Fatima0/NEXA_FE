import { NextResponse } from "next/server";
import { getDemoBotById } from "../../../../../lib/user-bots-demo-data";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const bot = getDemoBotById(id);
  if (!bot) {
    return NextResponse.json({ message: "Bot not found." }, { status: 404 });
  }
  return NextResponse.json({ bot });
}
