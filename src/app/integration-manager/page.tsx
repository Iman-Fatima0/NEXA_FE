import { redirect } from "next/navigation";

export default function IntegrationManagerRootPage() {
  redirect("/integration-manager/create");
}
