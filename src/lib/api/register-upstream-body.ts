/** Maps FE `RegisterAccountPayload` to NestJS `RegisterDto`. */
export function toNestRegisterBody(record: Record<string, unknown>): Record<string, unknown> {
  const email =
    typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const password = typeof record.password === "string" ? record.password : "";
  const fullName =
    typeof record.fullName === "string" ? record.fullName.trim() : "";
  const accountType = record.accountType === "company" ? "company" : "personal";

  const body: Record<string, unknown> = {
    email,
    password,
    accountType,
    fullName,
  };

  if (accountType === "company") {
    body.company = {
      name:
        typeof record.companyName === "string" ? record.companyName.trim() : "",
      industry:
        typeof record.industry === "string" && record.industry.trim()
          ? record.industry.trim()
          : null,
      website:
        typeof record.companyWebsite === "string" && record.companyWebsite.trim()
          ? record.companyWebsite.trim()
          : null,
      details:
        typeof record.companyDetails === "string"
          ? record.companyDetails.trim()
          : "",
    };
  }

  return body;
}

export function validateNestRegisterBody(
  body: Record<string, unknown>,
): string | null {
  if (typeof body.email !== "string" || !body.email) return "email is required";
  if (typeof body.password !== "string" || body.password.length < 8) {
    return "password must be at least 8 characters";
  }
  if (typeof body.fullName !== "string" || !body.fullName) {
    return "fullName is required";
  }
  if (body.accountType === "company") {
    const company =
      typeof body.company === "object" && body.company !== null
        ? (body.company as Record<string, unknown>)
        : null;
    if (!company?.name || typeof company.name !== "string") {
      return "company name is required";
    }
    if (!company?.details || typeof company.details !== "string") {
      return "company details are required";
    }
  }
  return null;
}
