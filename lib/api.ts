export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE_URL}${cleanPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // Keep default message.
    }
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, res.status);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }

  return res.blob() as T;
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return apiFetch<T>(path, { method: "GET" }, token);
}

export async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }, token);
}

export async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function apiDelete<T>(path: string, token?: string | null): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" }, token);
}
