/** Tolerate varying BE list envelopes until the API contract is finalized. */

export function pickArray<T>(parsed: unknown, keys: string[]): T[] {
  if (Array.isArray(parsed)) return parsed as T[];
  if (typeof parsed !== "object" || parsed === null) return [];
  const r = parsed as Record<string, unknown>;
  for (const k of keys) {
    const v = r[k];
    if (Array.isArray(v)) return v as T[];
  }
  const data = r.data;
  if (typeof data === "object" && data !== null) {
    return pickArray<T>(data, keys);
  }
  return [];
}
