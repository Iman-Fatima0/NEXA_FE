export function knowledgeFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function isValidKnowledgeUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
