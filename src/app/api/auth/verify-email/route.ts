import { bffPublicAuthPost } from "../../../../lib/api/bff-auth-public-proxy";

function pathVerifyEmailPost(): string {
  const p = process.env.BACKEND_AUTH_VERIFY_EMAIL_PATH?.trim();
  return p ? (p.startsWith("/") ? p : `/${p}`) : "/auth/verify-email";
}

/** NestJS: POST /auth/verify-email — body { token } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffPublicAuthPost(pathVerifyEmailPost(), body);
}
