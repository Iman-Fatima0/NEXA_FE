import { redirect } from "next/navigation";

/** Innovate + gallery CTAs use this path; send straight into the create flow. */
export default function WebsiteBuilderRootPage() {
  redirect("/website-builder/create");
}
