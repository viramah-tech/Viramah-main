const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  /** Pass a FormData/Blob/File to send multipart; Content-Type is set automatically. */
  formData?: FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Low-level fetch wrapper.
 * - Always sends session cookies (credentials: 'include').
 * - Backend envelope: { success, data } | { success: false, error: { message, code } }.
 * - On 2xx returns the full envelope; callers typically read `.data`.
 */
export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, headers: extraHeaders, signal } = options;

  const headers: Record<string, string> = { ...extraHeaders };
  let fetchBody: BodyInit | undefined;

  if (formData) {
    fetchBody = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: fetchBody,
    credentials: 'include',
    cache: 'no-store', // Prevent Next.js from caching dynamic API data.
    signal,
  });

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(`Non-JSON response from ${path}`, res.status);
    }
  }

  if (!res.ok) {
    const envelope = data as { error?: { message?: string; code?: string }; message?: string };
    const message = envelope?.error?.message || envelope?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, envelope?.error?.code);
  }

  return data as T;
}

/** Envelope used by every backend success response. */
export interface ApiEnvelope<T> {
  success: true;
  data: T;
}

/** Unwrap `{ success, data }` envelope. */
export async function apiGet<T>(path: string, init?: Omit<ApiOptions, 'method' | 'body' | 'formData'>): Promise<T> {
  const env = await apiFetch<ApiEnvelope<T>>(path, { ...init, method: 'GET' });
  return env.data;
}

export async function apiPost<T>(path: string, body?: unknown, init?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
  const env = await apiFetch<ApiEnvelope<T>>(path, { ...init, method: 'POST', body });
  return env.data;
}

export async function apiPut<T>(path: string, body?: unknown, init?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
  const env = await apiFetch<ApiEnvelope<T>>(path, { ...init, method: 'PUT', body });
  return env.data;
}

export async function apiPutForm<T>(path: string, formData: FormData, init?: Omit<ApiOptions, 'method' | 'body' | 'formData'>): Promise<T> {
  const env = await apiFetch<ApiEnvelope<T>>(path, { ...init, method: 'PUT', formData });
  return env.data;
}

export async function apiPostForm<T>(path: string, formData: FormData, init?: Omit<ApiOptions, 'method' | 'body' | 'formData'>): Promise<T> {
  const env = await apiFetch<ApiEnvelope<T>>(path, { ...init, method: 'POST', formData });
  return env.data;
}
