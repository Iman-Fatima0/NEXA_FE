import { SuperadminResourceClient } from "../../../components/superadmin/SuperadminResourceClient";
import { BFF_PATHS } from "../../../lib/api/bff-paths";

export default function SuperadminWebsitesPage() {
  return (
    <SuperadminResourceClient
      kind="websites"
      title="Websites"
      subtitle="Your admin account websites (GET /websites)"
      listKey="websites"
      listPath={BFF_PATHS.superadminWebsites}
      apiNote="Global admin website listing is not on NestJS yet — this shows websites owned by the signed-in ADMIN user."
      columns={[
        { key: "name", label: "Name" },
        { key: "description", label: "Domain" },
        { key: "updatedAt", label: "Updated" },
      ]}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "domain", label: "Domain" },
      ]}
    />
  );
}
