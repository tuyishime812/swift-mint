"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, MessageCircle, Moon, ShieldCheck, Sun, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import { getBalance } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/transfer", label: "Send Money" },
  { href: "/wallet", label: "Wallet" },
  { href: "/pay", label: "Pay Bills" },
  { href: "/countries", label: "Countries" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "Help" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setBalance(getBalance());
    const interval = setInterval(() => setBalance(getBalance()), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">SM</span>
          <span className="brand-name">SwiftMint Exchange</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link className={`admin-link ${pathname === "/admin" ? "active" : ""}`} href="/admin">
              <ShieldCheck size={14} />
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="nav-actions">
          <button
            className="nav-icon-btn theme-toggle"
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="nav-auth">
              <Link className="nav-wallet-btn" href="/wallet">
                <span className="nav-balance">MK {balance.toLocaleString()}</span>
              </Link>
              <Link className="nav-icon-btn" href="/dashboard" title="Dashboard">
                <User size={18} />
              </Link>
              <button className="nav-icon-btn" type="button" onClick={logout} title="Log out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link className="nav-signup" href="/signup">Sign up</Link>
              <Link className="nav-login" href="/login">Login</Link>
            </div>
          )}

          {user ? (
            <Link className="nav-action" href="/transfer">
              <MessageCircle size={18} aria-hidden="true" />
              <span>Send money</span>
            </Link>
          ) : (
            <Link className="nav-action" href="/transfer">
              <MessageCircle size={18} aria-hidden="true" />
              <span>Send money</span>
            </Link>
          )}
        </div>

        <button
          className={`menu-button${menuOpen ? " menu-button-open" : ""}`}
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((c) => !c)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div className={`mobile-panel${menuOpen ? " mobile-panel-open" : ""}`}>
        <div className="mobile-theme-row">
          <span>Theme</span>
          <button
            className="nav-icon-btn theme-toggle"
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span style={{ marginLeft: "0.5rem" }}>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-auth">
            {user ? (
              <>
                <Link className="nav-wallet-btn mobile-wallet-btn" href="/wallet">
                  <User size={16} />
                  MK {balance.toLocaleString()}
                </Link>
                <Link className="button button-primary" href="/dashboard">Dashboard</Link>
                <button className="button button-secondary" type="button" onClick={logout}>
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link className="button button-primary" href="/signup">Sign up</Link>
                <Link className="button button-secondary" href="/login">Login</Link>
              </>
            )}
          </div>
          <Link className="button button-primary" href="/transfer">
            <MessageCircle size={18} aria-hidden="true" />
            Send money
          </Link>
        </nav>
      </div>
    </header>
  );
}
