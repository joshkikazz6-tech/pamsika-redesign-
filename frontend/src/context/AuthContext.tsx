import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Api, ApiError } from '../lib/api';

export interface BackendUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  is_affiliate: boolean;
  affiliate_id: string | null;
  is_seller: boolean;
  seller_status: string | null;
  seller_business?: string | null;
  created_at: string;
}

interface AuthContextValue {
  user: BackendUser | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, referredBy?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Opens the auth modal and returns a promise that resolves once the user is signed in. */
  requireAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingAuthResolvers, setPendingAuthResolvers] = useState<((v: boolean) => void)[]>([]);

  const refreshUser = useCallback(async () => {
    if (!Api.token) {
      setUser(null);
      return;
    }
    try {
      const me = await Api.me();
      setUser(me as BackendUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    Api.onUnauthorized(() => setUser(null));
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    // Any pending requireAuth() callers get resolved as "cancelled"
    setPendingAuthResolvers((prev) => {
      prev.forEach((resolve) => resolve(false));
      return [];
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await Api.login(email, password);
    await refreshUser();
    setAuthModalOpen(false);
    setPendingAuthResolvers((prev) => {
      prev.forEach((resolve) => resolve(true));
      return [];
    });
  }, [refreshUser]);

  const register = useCallback(
    async (fullName: string, email: string, password: string, referredBy?: string | null) => {
      await Api.register(fullName, email, password, referredBy);
      await refreshUser();
      setAuthModalOpen(false);
      setPendingAuthResolvers((prev) => {
        prev.forEach((resolve) => resolve(true));
        return [];
      });
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    await Api.logout();
    setUser(null);
  }, []);

  /** Prompts login if needed; resolves true once signed in, false if the user cancels. */
  const requireAuth = useCallback((): Promise<boolean> => {
    if (user) return Promise.resolve(true);
    return new Promise((resolve) => {
      setPendingAuthResolvers((prev) => [...prev, resolve]);
      openAuthModal('login');
    });
  }, [user, openAuthModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
