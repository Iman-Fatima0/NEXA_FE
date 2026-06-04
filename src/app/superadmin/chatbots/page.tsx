import { SuperadminResourceClient } from "../../../components/superadmin/SuperadminResourceClient";
import { BFF_PATHS } from "../../../lib/api/bff-paths";

export default function SuperadminChatbotsPage() {
  return (
    <SuperadminResourceClient
      kind="chatbots"
      title="Chatbots"
      subtitle="Bots for your admin account (GET /bots)"
      listKey="chatbots"
      listPath={BFF_PATHS.superadminChatbots}
      itemPath={BFF_PATHS.superadminChatbot}
      apiNote="Uses NestJS /bots (owner-scoped). PATCH name/description, DELETE removes documents and chat sessions."
      columns={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "updatedAt", label: "Updated" },
      ]}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
