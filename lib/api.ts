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

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''; // SSR safety
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown; // we'll JSON.stringify it for you
};

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, headers, method = 'GET', ...rest } = options;

  const isWrite = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    method,
    credentials: 'include', // send the sessionid cookie cross-origin
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(isWrite ? { 'X-CSRFToken': getCookie('csrftoken') } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — nothing to parse, return undefined.
  if (res.status === 204) {
    return undefined as T;
  }

  // Try to parse JSON; fall back to text for HTML error pages.
  const contentType = res.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, payload);
  }

  return payload as T;
}

export async function primeCsrf(): Promise<void> {
  await api<{ csrfToken: string }>('/api/auth/csrf/');
}