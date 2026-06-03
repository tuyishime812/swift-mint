"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGetMe, apiLogin as apiLoginReq, apiSignup as apiSignupReq, type UserData } from "./api";

type AuthContext = {
  user: UserData | null;
  token: string | null;
  balance: number;
  loading: boolean;
  login: (phone: string, password: string) => Promise<string | null>;
  signup: (input: { name: string; phone: string; email: string; password: string }) => Promise<string | null>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
};

const AuthCtx = createContext<AuthContext | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sm-token");
}

function storeToken(token: string) {
  localStorage.setItem("sm-token", token);
}

function clearToken() {
  localStorage.removeItem("sm-token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      apiGetMe(stored)
        .then((data) => {
          setToken(stored);
          setUser(data.user);
          setBalance(data.balance);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<string | null> => {
    try {
      const data = await apiLoginReq(phone, password);
      storeToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setBalance(data.balance);
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : "Login failed";
    }
  }, []);

  const signup = useCallback(async (input: {
    name: string;
    phone: string;
    email: string;
    password: string;
  }): Promise<string | null> => {
    try {
      const data = await apiSignupReq(input);
      storeToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setBalance(data.balance);
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : "Signup failed";
    }
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

  return (
    <AuthCtx.Provider value={{ user, token, balance, loading, login, signup, logout, refreshBalance }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
