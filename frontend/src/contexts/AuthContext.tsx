import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { AuthState } from '../types/auth';
import {
  ADMIN_SESSION_KEY, MEMBER_SESSION_KEY,
  ADMIN_SESSION_TTL_MS, MEMBER_SESSION_TTL_MS,
} from '../types/auth';

interface AuthContextValue extends AuthState {
  isAdmin: boolean;
  isMember: boolean;
  isGuest: boolean;
  loginAdmin: (token: string) => Promise<boolean>;
  loginMember: (nickname: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): AuthState {
  const adminRaw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (adminRaw) {
    try {
      const session = JSON.parse(adminRaw);
      if (Date.now() - session.loginAt < ADMIN_SESSION_TTL_MS) {
        return { role: 'admin', nickname: '관리자', adminToken: session.token };
      }
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch { /* ignore */ }
  }

  const memberRaw = localStorage.getItem(MEMBER_SESSION_KEY);
  if (memberRaw) {
    try {
      const session = JSON.parse(memberRaw);
      if (Date.now() - session.loginAt < MEMBER_SESSION_TTL_MS) {
        return { role: 'member', nickname: session.nickname, adminToken: '' };
      }
      localStorage.removeItem(MEMBER_SESSION_KEY);
    } catch { /* ignore */ }
  }

  return { role: 'guest', nickname: '', adminToken: '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadSession);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = loadSession();
      if (current.role !== auth.role) setAuth(current);
    }, 60000);
    return () => clearInterval(interval);
  }, [auth.role]);

  const loginAdmin = useCallback(async (token: string): Promise<boolean> => {
    try {
      const headers = new Headers({
        'x-admin-token': token,
        'Content-Type': 'application/json',
      });
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/admin/ping`, { headers });
      if (!res.ok) return false;

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ token, loginAt: Date.now() }));
      localStorage.removeItem(MEMBER_SESSION_KEY);
      setAuth({ role: 'admin', nickname: '관리자', adminToken: token });
      return true;
    } catch {
      return false;
    }
  }, []);

  const loginMember = useCallback((nickname: string) => {
    localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify({ nickname, loginAt: Date.now() }));
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAuth({ role: 'member', nickname, adminToken: '' });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(MEMBER_SESSION_KEY);
    setAuth({ role: 'guest', nickname: '', adminToken: '' });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    ...auth,
    isAdmin: auth.role === 'admin',
    isMember: auth.role === 'member',
    isGuest: auth.role === 'guest',
    loginAdmin,
    loginMember,
    logout,
  }), [auth, loginAdmin, loginMember, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
