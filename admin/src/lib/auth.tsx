import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

interface User { id: string; username: string; email: string; role: string; avatar?: string; bio?: string; createdAt: string; }
interface AuthState { user: User | null; loading: boolean; login: (email: string, password: string, code?: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mortar_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((res) => setUser(res.data)).catch(() => { localStorage.removeItem('mortar_token'); }).finally(() => setLoading(false));
  }, []);

  // Two-step login: password first; if 2FA is enabled, the caller supplies the code
  // and we exchange the short-lived temp token for the real one.
  const login = useCallback(async (email: string, password: string, code?: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.twoFactorRequired) {
      if (!code) throw Object.assign(new Error('2FA required'), { response: { data: { twoFactorRequired: true } } });
      const verify = await api.post('/auth/2fa/verify', { tempToken: res.data.tempToken, code });
      localStorage.setItem('mortar_token', verify.data.token);
      setUser(verify.data.user);
      return;
    }
    localStorage.setItem('mortar_token', res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    const token = localStorage.getItem('mortar_token');
    if (token) api.post('/auth/logout').catch(() => {}); // server-side token blacklist
    localStorage.removeItem('mortar_token');
    setUser(null);
  }, []);

  return React.createElement(AuthContext.Provider, { value: { user, loading, login, logout } }, children);
}

export const useAuth = () => useContext(AuthContext);
