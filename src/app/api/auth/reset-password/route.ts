import { bffPublicAuthPost } from "../../../../lib/api/bff-auth-public-proxy";
import { pathAuthResetPassword } from "../../../../lib/api/upstream-paths";

/** NestJS: POST /auth/reset-password — body { token, newPassword } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffPublicAuthPost(pathAuthResetPassword(), body);
}
