"use client";

/**
 * Admin authentication context.
 *
 * Stores the JWT in localStorage (simple approach appropriate for an
 * internship project with no sensitive PII in the admin-only UI).
 *
 * Security tradeoff documented:
 * - localStorage is vulnerable to XSS. We mitigate this by:
 *   1. Sanitizing all Markdown content before rendering.
 *   2. Never using dangerouslySetInnerHTML with unsanitized data.
 *   3. Applying a strict Content Security Policy (via Next.js headers config).
 * - A production upgrade path would be HttpOnly cookies with CSRF tokens.
 *
 * The JWT is only used for Authorization: Bearer headers in API calls.
 * It is never injected into script blocks or rendered in the DOM.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthUser } from "@/types";

const TOKEN_KEY = "fm_admin_token";
const USER_KEY = "fm_admin_user";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Rehydrate from localStorage on mount (client-only).
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        // Corrupt data — clear it.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoaded(true);
  }, []);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Don't render children until localStorage has been read.
  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
