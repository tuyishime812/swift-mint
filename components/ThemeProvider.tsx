"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContext = {
  theme: Theme;
  toggle: () => void;
};

const ThemeCtx = createContext<ThemeContext | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("sm-theme");
  if (stored === "dark" || stored === "light") return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sm-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
