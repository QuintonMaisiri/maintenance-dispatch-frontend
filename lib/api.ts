import { API_BASE_URL } from './config';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

let csrfToken = '';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers, method = 'GET', ...rest } = options;
  const isWrite = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(isWrite ? { 'X-CSRFToken': csrfToken } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) throw new ApiError(res.status, payload);
  return payload as T;
}

export async function primeCsrf(): Promise<void> {
  const data = await api<{ csrfToken: string }>('/api/auth/csrf/');
  csrfToken = data.csrfToken;
}