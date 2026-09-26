import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

interface User { id: string; username: string; email: string; role: string; avatar?: string; bio?: string; createdAt: string; capabilities?: string[]; }
interface AuthState { user: User | null; loading: boolean; login: (email: string, password: string, code?: string) => Promise<void>; logout: () => void; can: (cap: string) => boolean; refresh: () => Promise<void>; }

const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => {}, logout: () => {}, can: () => false, refresh: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Pull the current account, capabilities included. Re-runnable so a role edit
  // can refresh the snapshot: otherwise the sidebar and the route guards keep
  // what was loaded at login until a full page reload.
  const refresh = useCallback(async () => {
    const token = localStorage.getItem('mortar_token');
    if (!token) { setUser(null); return; }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err: any) {
      // Only a rejected session means "logged out": a 429 from the rate limiter or
      // a network blip used to clear the token and bounce the user to the login
      // screen mid-edit.
      if (err?.response?.status === 401) { localStorage.removeItem('mortar_token'); setUser(null); }
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('mortar_token')) { setLoading(false); return; }
    refresh().finally(() => setLoading(false));
    // The Roles screen fires this after a successful save so a change to the
    // caller's own role shows up without a reload.
    const onPermissionsChanged = () => { refresh(); };
    window.addEventListener('mortar-permissions-changed', onPermissionsChanged);
    return () => window.removeEventListener('mortar-permissions-changed', onPermissionsChanged);
  }, [refresh]);

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

  // Capability check mirroring the server's userCan(): the capabilities come from
  // /auth/me, and admins hold '*'. Navigation uses this so a custom role granted
  // a capability sees the screen it unlocks (the sidebar used to filter by role
  // name only, which made newly-grantable areas unreachable from the UI).
  const can = useCallback((cap: string) => {
    const caps = user?.capabilities || [];
    return caps.includes('*') || caps.includes(cap);
  }, [user?.capabilities]);

  return React.createElement(AuthContext.Provider, { value: { user, loading, login, logout, can, refresh } }, children);
}

export const useAuth = () => useContext(AuthContext);
