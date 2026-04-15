const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isLocalhostBaseUrl = configuredBaseUrl?.startsWith('http://localhost') || configuredBaseUrl?.startsWith('https://localhost');
const runtimeBaseUrl = `${window.location.origin}/api`;
const BASE_URL = configuredBaseUrl && (!isLocalhostBaseUrl || window.location.hostname === 'localhost')
  ? configuredBaseUrl.replace(/\/$/, '')
  : runtimeBaseUrl;

function getToken(): string | null {
  return localStorage.getItem('taxtalk_token');
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, ...init } = options;
  const headers = new Headers(init.headers ?? {});

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error ?? errorBody?.message ?? errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(errorMessage, response.status);
  }

  // SSE streams: caller handles the Response directly
  if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
    return response as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    return null as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new ApiError('Invalid JSON response from server', response.status);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Convenience wrappers
export const api = {
  get: <T>(path: string, opts?: ApiOptions) =>
    apiFetch<T>(path, { method: 'GET', ...opts }),

  post: <T>(path: string, body: unknown, opts?: ApiOptions) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),

  put: <T>(path: string, body: unknown, opts?: ApiOptions) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: ApiOptions) =>
    apiFetch<T>(path, { method: 'DELETE', ...opts }),
};
