'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, ApiError, primeCsrf } from './api';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;          // true while we're still figuring out who's logged in
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: prime the CSRF cookie, then ask the backend who we are.
  // If /me/ returns 403 we're anonymous — that's normal, not an error.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await primeCsrf();
        const me = await api<User>('/api/auth/me/');
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 403) {
          // Real network failure - log it so dev sees it in the console.
          console.error('Auth bootstrap failed:', err);
        }
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const me = await api<User>('/api/auth/login/', {
      method: 'POST',
      body: { username, password },
    });
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await api('/api/auth/logout/', { method: 'POST' });
    setUser(null);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const me = await api<User>('/api/auth/register/', {
      method: 'POST',
      body: data,
    });
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, register }),
    [user, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}