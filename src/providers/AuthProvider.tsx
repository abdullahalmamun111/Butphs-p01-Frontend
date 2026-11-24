import React, { createContext, useCallback, useContext, useState } from 'react';
import { authService } from '../services';
import type { AuthUser, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'butphs_mvp_demo_session_v2';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<AuthUser>;
  logout: () => void;
  updateCurrentUserProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSavedSession(): AuthUser | null {
  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return authService.getEffectiveUser(parsed);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadSavedSession());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, expectedRole?: UserRole) => {
    setLoading(true);
    try {
      const authenticated = await authService.login(email, password, expectedRole);
      setUser(authenticated);
      try {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticated));
      } catch {
        // Ignore storage error
      }
      return authenticated;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }, []);

  const updateCurrentUserProfile = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = { ...prev, ...patch };
      authService.saveProfileOverride(prev.email, patch);
      try {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateCurrentUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
