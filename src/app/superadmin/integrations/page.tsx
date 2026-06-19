import { SuperadminResourceClient } from "../../../components/superadmin/SuperadminResourceClient";
import { BFF_PATHS } from "../../../lib/api/bff-paths";

export default function SuperadminIntegrationsPage() {
  return (
    <SuperadminResourceClient
      kind="integrations"
      title="Integrations"
      subtitle="Chatbot ↔ website connections"
      listKey="integrations"
      listPath={BFF_PATHS.superadminIntegrations}
      readOnly
      apiNote="Not implemented on NestJS yet (websites are not connected to chat). This tab will light up when your API adds integration routes."
      columns={[
        { key: "name", label: "Name" },
        { key: "websiteId", label: "Website ID" },
        { key: "chatbotId", label: "Chatbot ID" },
        { key: "status", label: "Status" },
      ]}
      fields={[]}
    />
  );
}
