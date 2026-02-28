'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { User, Store } from './types';
import { authService } from './auth-service';

export interface AuthContextType {
  user: User | null;
  store: Store | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, storeName?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string, storeName: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await authService.getSession();
        if (userData) {
          setUser(userData.user);
          setStore(userData.store);
        }
      } catch (error) {
        console.error('[v0] Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, storeName?: string) => {
    setIsLoading(true);
    try {
      const { user: userData, store: storeData } = await authService.login(email, password, storeName);
      setUser(userData);
      setStore(storeData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setStore(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, storeName: string) => {
    setIsLoading(true);
    try {
      const { user: userData, store: storeData } = await authService.register(
        email,
        password,
        fullName,
        storeName
      );
      setUser(userData);
      setStore(storeData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    store,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
