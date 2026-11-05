export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type User = { id: number; email: string; name: string; role: 'staff' | 'admin'; must_change_password: boolean };

export class ApiError extends Error {
  statusCode: number;
  source: 'db' | 'backend' | 'network';
  db_constraint?: string | null;
  code?: string;
  constructor(statusCode: number, source: 'db' | 'backend' | 'network', message: string, db_constraint?: string | null, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.source = source;
    this.db_constraint = db_constraint;
    this.code = code;
  }
}

const TOKEN_KEY = 'corner_admin_token';
const USER_KEY = 'corner_admin_user';

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? (JSON.parse(s) as User) : null;
  } catch {
    return null;
  }
};
export const saveSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const saveUser = (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; noAuthRedirect?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method || (opts.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network', '서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해 주세요.');
  }
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    const err = new ApiError(res.status, data?.source === 'db' ? 'db' : 'backend', msg || `요청이 실패했어요 (${res.status})`, data?.db_constraint, data?.code);
    if (typeof window !== 'undefined' && !opts.noAuthRedirect) {
      if (res.status === 401) {
        clearSession();
        window.location.href = '/login';
      } else if (res.status === 403 && err.code === 'MUST_CHANGE_PASSWORD') {
        const u = getUser();
        if (u) saveUser({ ...u, must_change_password: true });
        window.location.href = '/change-password';
      }
    }
    throw err;
  }
  return data as T;
}
