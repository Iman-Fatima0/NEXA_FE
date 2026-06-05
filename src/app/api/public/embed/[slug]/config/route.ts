import { bffPublicGet } from "../../../../../../lib/api/bff-public-proxy";
import { pathPublicEmbedConfig } from "../../../../../../lib/api/upstream-paths";

type Params = { params: Promise<{ slug: string }> };

/**
 * NestJS contract: GET /public/embed/:slug/config
 * Response (no apiKey): { publicSlug, name, welcomeMessage, status, theme? }
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return Response.json({ error: "validation_error", message: "slug is required" }, { status: 400 });
  }
  return bffPublicGet(pathPublicEmbedConfig(slug.trim()));
}
