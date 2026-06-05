import { jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";

export async function GET() {
  return jsonNoStore({ message: "Single-user admin detail is not on NestJS. Use GET /users." }, { status: 501 });
}

export async function PUT() {
  return jsonNoStore({ message: "User update is not on NestJS." }, { status: 501 });
}

export async function DELETE() {
  return jsonNoStore({ message: "User delete is not on NestJS." }, { status: 501 });
}
