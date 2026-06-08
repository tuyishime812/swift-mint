"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0/client";
import { apiGetMe, apiLogin, apiSignup, type UserData } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AuthContext = {
  user: UserData | null;
  token: string | null;
  balance: number;
  loading: boolean;
  isAdmin: boolean;
  login: (email_or_username: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, username: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  signupWithGoogle: () => void;
  logout: () => void;
  refreshBalance: () => Promise<void>;
};

const AuthCtx = createContext<AuthContext | null>(null);

const TOKEN_KEY = "swiftmint_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<UserData | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth0Loading) return;

    const storedToken = getStoredToken();

    if (storedToken) {
      let cancelled = false;
      apiGetMe(storedToken).then((data) => {
        if (cancelled) return;
        setToken(storedToken);
        setUser(data.user);
        setBalance(data.balance);
      }).catch(() => {
        if (cancelled) return;
        clearToken();
        setToken(null);
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => { cancelled = true; };
    }

    if (auth0User) {
      let cancelled = false;
      (async () => {
        try {
          const auth0AccessToken = await getAccessToken();
          const res = await fetch(`${API_BASE}/api/auth/auth0`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: auth0AccessToken }),
          });
          if (!res.ok) throw new Error("Auth0 exchange failed");
          const data = await res.json();
          if (cancelled) return;
          storeToken(data.token);
          setToken(data.token);
          setUser(data.user);
          setBalance(data.balance ?? 0);
        } catch {
          if (cancelled) return;
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }

    setLoading(false);
  }, [auth0User, auth0Loading]);

  const login = useCallback(async (email_or_username: string, password: string) => {
    const data = await apiLogin({ email_or_username, password });
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, username: string, password: string) => {
    const data = await apiSignup({ name, email, phone, username, password });
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = "/auth/login";
  }, []);

  const signupWithGoogle = useCallback(() => {
    window.location.href = "/auth/login?screen_hint=signup";
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setBalance(0);
    window.location.href = "/auth/logout";
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!token) return;
    try {
      const me = await apiGetMe(token);
      setBalance(me.balance);
    } catch {
      // ignore
    }
  }, [token]);

  const isAdmin = user?.is_admin === true;

  return (
    <AuthCtx.Provider value={{ user, token, balance, loading, isAdmin, login, signup, loginWithGoogle, signupWithGoogle, logout, refreshBalance }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
