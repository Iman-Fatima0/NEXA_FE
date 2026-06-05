import { jsonNoStore, bffUserResourceMultipartPost } from "../../../../../../lib/api/bff-upstream-proxy";
import { pathUserWebsiteSectionImage } from "../../../../../../lib/api/upstream-paths";

type RouteContext = { params: Promise<{ id: string }> };

/** `POST {BACKEND}/websites/:id/section-image` — multipart image upload. */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const empty = () => jsonNoStore({ message: "Backend not configured." }, { status: 503 });
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonNoStore({ message: "Invalid form data." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return jsonNoStore({ message: 'Missing file field "file".' }, { status: 400 });
  }
  const upstream = new FormData();
  upstream.append("file", file);
  return bffUserResourceMultipartPost(pathUserWebsiteSectionImage(id), upstream, empty);
}
