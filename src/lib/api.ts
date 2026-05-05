import { env } from "../config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getBaseUrl(overrideBaseUrl?: string): string {
  if (overrideBaseUrl && overrideBaseUrl.trim().length > 0) {
    return overrideBaseUrl;
  }

  return env.backendApiBaseUrl;
}

function toUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
  baseUrlOverride?: string
): Promise<TResponse> {
  const baseUrl = getBaseUrl(baseUrlOverride);
  if (!baseUrl) {
    throw new Error("API base URL is not configured. Set NEXT_PUBLIC_BACKEND_API_BASE_URL or a feature-specific API URL.");
  }

  const serializedBody = options.body === undefined ? undefined : JSON.stringify(options.body);

  const response = await fetch(toUrl(baseUrl, path), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: serializedBody,
    cache: options.cache ?? "no-store",
  });

  const payload = await parseResponse(response);
  if (response.ok) {
    return payload as TResponse;
  }

  const message = `Request failed with status ${response.status}`;
  throw new ApiError(message, response.status, payload);
}
