import { BFF_PATHS } from "../api/bff-paths";
import { ingestPlatformDocument, ingestPlatformUrl } from "../chatbot/chatbot-platform-api";
import { isIngestableFile, textFileFromString } from "../chatbot/ingest-files";

export type IngestKnowledgeInput = {
  files?: File[];
  text?: string;
  urls?: string[];
};

type DocumentRow = { ingestStatus?: string };

function documentsBusy(docs: DocumentRow[]): boolean {
  return docs.some((d) => {
    const s = (d.ingestStatus ?? "").toUpperCase();
    return s === "PENDING" || s === "PROCESSING";
  });
}

async function listBotDocuments(botId: string): Promise<DocumentRow[]> {
  const res = await fetch(BFF_PATHS.documents(botId), {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data as DocumentRow[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.documents)) return o.documents as DocumentRow[];
  }
  return [];
}

/** Wait until PDF/text/URL ingestion finishes (same queue as chatbot training). */
export async function waitForKnowledgeIngest(
  botId: string,
  onStatus?: (message: string) => void,
  timeoutMs = 120_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  onStatus?.("Processing knowledge base…");
  while (Date.now() < deadline) {
    const docs = await listBotDocuments(botId);
    if (!docs.length || !documentsBusy(docs)) {
      return;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

export async function ingestKnowledgeToBot(
  botId: string,
  input: IngestKnowledgeInput,
  onStatus?: (message: string) => void,
): Promise<boolean> {
  let uploaded = false;
  const docFiles = (input.files ?? []).filter(isIngestableFile);
  for (let i = 0; i < docFiles.length; i++) {
    onStatus?.(`Uploading documents (${i + 1}/${docFiles.length})…`);
    await ingestPlatformDocument(botId, docFiles[i]!);
    uploaded = true;
  }

  const urls = (input.urls ?? []).map((u) => u.trim()).filter(Boolean);
  for (let i = 0; i < urls.length; i++) {
    onStatus?.(`Processing websites (${i + 1}/${urls.length})…`);
    await ingestPlatformUrl(botId, urls[i]!);
    uploaded = true;
  }

  const text = input.text?.trim();
  if (text) {
    onStatus?.("Adding custom knowledge…");
    await ingestPlatformDocument(botId, textFileFromString(text));
    uploaded = true;
  }

  if (uploaded) {
    await waitForKnowledgeIngest(botId, onStatus);
  }
  return uploaded;
}
