import { SuperadminResourceClient } from "../../../components/superadmin/SuperadminResourceClient";
import { BFF_PATHS } from "../../../lib/api/bff-paths";

export default function SuperadminUsersPage() {
  return (
    <SuperadminResourceClient
      kind="users"
      title="Users"
      subtitle="All accounts (NestJS GET /users, ADMIN only)"
      listKey="users"
      listPath={BFF_PATHS.superadminUsers}
      itemPath={BFF_PATHS.superadminUser}
      readOnly
      apiNote="Read-only: NestJS exposes GET /users for ADMIN. Registration is POST /auth/register."
      columns={[
        { key: "email", label: "Email" },
        { key: "displayName", label: "Name" },
        { key: "status", label: "Role" },
        { key: "createdAt", label: "Created" },
      ]}
      fields={[]}
    />
  );
}
