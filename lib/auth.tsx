"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
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

async function exchangeFirebaseToken(): Promise<{ token: string; user: UserData; balance: number }> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated with Firebase");
  const idToken = await currentUser.getIdToken();
  const res = await fetch(`${API_BASE}/api/auth/firebase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Firebase auth failed");
  }
  return res.json();
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
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, username: string, password: string) => {
    const data = await apiSignup({ name, email, phone, username, password });
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
    const data = await exchangeFirebaseToken();
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(data.balance ?? 0);
  }, []);

  const signupWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
    const data = await exchangeFirebaseToken();
    storeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(data.balance ?? 0);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setBalance(0);
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
