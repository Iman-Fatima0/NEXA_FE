import { bffPublicAuthPost } from "../../../../lib/api/bff-auth-public-proxy";
import { pathAuthForgotPassword } from "../../../../lib/api/upstream-paths";

/** NestJS: POST /auth/forgot-password — body { email } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return bffPublicAuthPost(pathAuthForgotPassword(), body);
}
