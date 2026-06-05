import { messageFromErrorBody } from "./bff-error-message";

/** Default fetch options for same-origin BFF calls. */
const defaultInit: Pick<RequestInit, "credentials" | "cache"> = {
  credentials: "same-origin",
  cache: "no-store",
};

export async function parseBffErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as unknown;
    return messageFromErrorBody(data, fallback);
  } catch {
    /* ignore */
  }
  return fallback;
}

/**
 * JSON `fetch` to a Next `/api/*` route. Throws `Error` with a readable message when `!res.ok`.
 */
export async function bffJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...defaultInit, ...init });
  if (!res.ok) {
    let msg = await parseBffErrorMessage(res, `Request failed (${res.status}).`);
    if (res.status === 404 && path.includes("/section-image")) {
      msg =
        "Image upload API not found. Restart the NEXA backend (npm run start:dev in the NEXA folder) and try again.";
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}
