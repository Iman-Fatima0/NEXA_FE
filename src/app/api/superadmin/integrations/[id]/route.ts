import { jsonNoStore } from "../../../../../lib/api/bff-upstream-proxy";

export async function GET() {
  return jsonNoStore({ message: "Integrations API is not implemented on NestJS yet." }, { status: 501 });
}

export async function PUT() {
  return jsonNoStore({ message: "Integrations API is not implemented on NestJS yet." }, { status: 501 });
}

export async function DELETE() {
  return jsonNoStore({ message: "Integrations API is not implemented on NestJS yet." }, { status: 501 });
}
