"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabaseClient } from "./supabase";
import { apiGetMe, apiLogin, apiSignup, apiExchangeSupabaseToken, type UserData } from "./api";

type AuthContext = {
  user: UserData | null;
  token: string | null;
  balance: number;
  loading: boolean;
  isAdmin: boolean;
  login: (email_or_username: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: () => Promise<void>;
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
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<UserData | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setLoading(false);
      return;
    }
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
  }, []);

  const login = useCallback(async (email_or_username: string, password: string) => {
    const data = await apiLogin({ email_or_username, password });
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    const me = await apiGetMe(data.token);
    setBalance(me.balance);
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, username: string, password: string) => {
    const data = await apiSignup({ name, email, phone, username, password });
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(0);
  }, []);

  const handleGoogleAuth = useCallback(async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await handleGoogleAuth();
  }, [handleGoogleAuth]);

  const signupWithGoogle = useCallback(async () => {
    await handleGoogleAuth();
  }, [handleGoogleAuth]);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setBalance(0);
    supabaseClient.auth.signOut();
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
