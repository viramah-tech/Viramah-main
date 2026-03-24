const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  // Auto-attach token: use explicitly passed token, or fall back to localStorage
  const authToken = token ?? (typeof window !== 'undefined' ? localStorage.getItem('viramah_token') : null);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  return data;
}
