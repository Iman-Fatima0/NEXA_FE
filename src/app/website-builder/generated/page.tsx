import { redirect } from "next/navigation";

/** Legacy route — send users to the real builder create flow. */
export default function GeneratedWebsitePage() {
  redirect("/website-builder/create");
}
