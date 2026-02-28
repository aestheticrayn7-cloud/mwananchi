import { User, Store } from './types';
import { supabase } from './supabase';

interface SessionData {
  user: User;
  store: Store;
}

class AuthService {
  async getSession(): Promise<SessionData | null> {
    try {
      const sessionData = localStorage.getItem('mwananchi_session');
      if (!sessionData) return null;

      const { user, store } = JSON.parse(sessionData);
      return { user, store };
    } catch (error) {
      console.error('[v0] Failed to get session:', error);
      return null;
    }
  }

  async login(
    email: string,
    password: string,
    storeName?: string
  ): Promise<SessionData> {
    try {
      // Call login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, storeName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user, store } = await response.json();

      // Store session in localStorage
      localStorage.setItem('mwananchi_session', JSON.stringify({ user, store }));
      localStorage.setItem('mwananchi_token', user.token);

      return { user, store };
    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('mwananchi_session');
      localStorage.removeItem('mwananchi_token');
    } catch (error) {
      console.error('[v0] Logout error:', error);
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    storeName: string
  ): Promise<SessionData> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, storeName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const { user, store } = await response.json();

      // Store session
      localStorage.setItem('mwananchi_session', JSON.stringify({ user, store }));
      localStorage.setItem('mwananchi_token', user.token);

      return { user, store };
    } catch (error) {
      console.error('[v0] Registration error:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return null;

      const { user } = await response.json();
      return user;
    } catch (error) {
      console.error('[v0] Token verification error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
