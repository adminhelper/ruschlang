const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_TIMEOUT_MS = 10_000;

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  const adminRaw = localStorage.getItem('ruschlang:admin:session');
  if (adminRaw) {
    try {
      const session = JSON.parse(adminRaw);
      const ttl = 8 * 60 * 60 * 1000;
      if (Date.now() - session.loginAt < ttl) {
        headers['x-admin-token'] = session.token;
        headers['x-user-role'] = 'admin';
        return headers;
      }
      localStorage.removeItem('ruschlang:admin:session');
    } catch { /* ignore */ }
  }

  const memberRaw = localStorage.getItem('ruschlang:member:session');
  if (memberRaw) {
    try {
      const session = JSON.parse(memberRaw);
      const ttl = 12 * 60 * 60 * 1000;
      if (Date.now() - session.loginAt < ttl) {
        headers['x-user-role'] = 'member';
        headers['x-user-nickname'] = encodeURIComponent(session.nickname);
        return headers;
      }
      localStorage.removeItem('ruschlang:member:session');
    } catch { /* ignore */ }
  }

  headers['x-user-role'] = 'guest';
  return headers;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const authHeaders = getAuthHeaders();
  const headers = new Headers(fetchOptions.headers);
  for (const [key, value] of Object.entries(authHeaders)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal ?? controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new ApiError(response.status, text || `요청 실패 (${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return response.text() as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, '요청 시간이 초과되었습니다.');
    }
    throw new ApiError(0, '네트워크 연결을 확인해주세요.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
