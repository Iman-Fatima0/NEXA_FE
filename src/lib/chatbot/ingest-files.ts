/** NestJS ingest: PDF, DOCX, TXT (max 15 MB per file). */

const INGEST_MIME = new Set([
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const INGEST_EXT = /\.(pdf|txt|docx)$/i;

export function isIngestableFile(file: File): boolean {
  if (INGEST_MIME.has(file.type)) return true;
  return INGEST_EXT.test(file.name);
}

export function textFileFromString(content: string, filename = "knowledge.txt"): File {
  const blob = new Blob([content], { type: "text/plain" });
  return new File([blob], filename, { type: "text/plain" });
}

export const INGEST_ACCEPT =
  ".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const INGEST_HINT = "PDF, Word (.docx), or text files — up to 15 MB each.";
