import { ApiError, ApiSuccess } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiRequestError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  cache?: RequestCache;
  next?: { revalidate?: number };
}

/**
 * Central fetch wrapper. Every backend response follows the
 * { success, data | message/errors } envelope, so this is the one
 * place that unwraps it and turns failures into a typed error.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
  });

  const json = (await res.json()) as ApiSuccess<T> | ApiError;

  if (!res.ok || !json.success) {
    const errJson = json as ApiError;
    throw new ApiRequestError(errJson.message ?? "Request failed", res.status, errJson.errors);
  }

  return (json as ApiSuccess<T>).data;
}
