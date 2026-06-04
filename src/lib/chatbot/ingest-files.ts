/** NestJS ingest accepts PDF and TXT only (max 15 MB per file). */

const INGEST_MIME = new Set(["application/pdf", "text/plain"]);
const INGEST_EXT = /\.(pdf|txt)$/i;

export function isIngestableFile(file: File): boolean {
  if (INGEST_MIME.has(file.type)) return true;
  return INGEST_EXT.test(file.name);
}

export function textFileFromString(content: string, filename = "knowledge.txt"): File {
  const blob = new Blob([content], { type: "text/plain" });
  return new File([blob], filename, { type: "text/plain" });
}

export const INGEST_ACCEPT = ".pdf,.txt,application/pdf,text/plain";
export const INGEST_HINT = "PDF or TXT only, max 15 MB per file (NestJS /documents/ingest).";
