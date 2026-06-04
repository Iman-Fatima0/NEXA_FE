/** Maps HTTP status to business-friendly copy (no infra jargon). */

const BY_STATUS: Record<number, string> = {
  401: "Please sign in to continue.",
  403: "You do not have access to this chatbot.",
  404: "Chatbot unavailable.",
  429: "Rate limit exceeded. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  503: "AI service unavailable. Please try again shortly.",
};

export function friendlyErrorForStatus(status: number, context?: "upload" | "url" | "chat" | "train"): string {
  if (status === 404) return BY_STATUS[404]!;
  if (status === 429) return BY_STATUS[429]!;
  if (status === 503) return BY_STATUS[503]!;
  if (status >= 500) return BY_STATUS[500]!;
  if (status === 401) return BY_STATUS[401]!;
  if (status === 403) return BY_STATUS[403]!;
  if (context === "upload") return "Document upload failed. Check the file type and size, then try again.";
  if (context === "url") return "Knowledge processing failed for that website. Check the URL and try again.";
  if (context === "chat") return "Message could not be sent. Please try again.";
  if (context === "train") return "Training could not be completed. Please try again.";
  return "Something went wrong. Please try again.";
}

export async function parseFriendlyBffError(
  res: Response,
  fallback: string,
  context?: "upload" | "url" | "chat" | "train",
): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    const raw = (typeof data.message === "string" && data.message.trim()) || (typeof data.error === "string" && data.error.trim());
    if (raw) {
      const lower = raw.toLowerCase();
      if (lower.includes("rate") || lower.includes("429")) return BY_STATUS[429]!;
      if (lower.includes("unavailable") || lower.includes("503")) return BY_STATUS[503]!;
      if (lower.includes("upload") || lower.includes("document")) return friendlyErrorForStatus(res.status, "upload");
      if (lower.includes("ingest") || lower.includes("url")) return friendlyErrorForStatus(res.status, "url");
      return raw;
    }
  } catch {
    /* ignore */
  }
  return friendlyErrorForStatus(res.status, context) || fallback;
}
