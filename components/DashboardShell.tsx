"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Smartphone,
  Wallet,
  User,
  ShieldCheck,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import { NotificationBell } from "@/components/NotificationBell";
import { whatsappNumber } from "@/lib/swiftmint";

type NavItem = { href: string; label: string; icon: React.ElementType };

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transfer", label: "Send Money", icon: Send },
  { href: "/pay", label: "Pay Bills", icon: Smartphone },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

export function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isAdmin, balance } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close the drawer on navigation
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  const navLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`dash-nav-link${active ? " active" : ""}`}
      >
        <Icon size={18} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className={`dash-sidebar${drawerOpen ? " open" : ""}`} aria-label="Dashboard navigation">
        <Link className="dash-sidebar-brand" href="/">
          <span className="brand-mark">SM</span>
          <span className="dash-sidebar-brand-name">SwiftMint</span>
        </Link>

        <nav className="dash-nav">
          <p className="dash-nav-label">Menu</p>
          {mainNav.map(navLink)}

          {isAdmin ? (
            <>
              <p className="dash-nav-label">Admin</p>
              {navLink({ href: "/admin", label: "Admin", icon: ShieldCheck })}
            </>
          ) : null}
        </nav>

        <div className="dash-sidebar-footer">
          <a
            className="dash-nav-link"
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>Help &amp; Support</span>
          </a>
          <button className="dash-nav-link dash-nav-logout" type="button" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {drawerOpen ? (
        <button
          className="dash-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      {/* Main column */}
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              className="dash-menu-btn"
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="dash-topbar-titles">
              <h1 className="dash-topbar-title">{title}</h1>
              {subtitle ? <p className="dash-topbar-subtitle">{subtitle}</p> : null}
            </div>
          </div>

          <div className="dash-topbar-actions">
            <button
              className="nav-icon-btn"
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
            <Link className="dash-balance-pill" href="/wallet" title="View wallet">
              <Wallet size={15} aria-hidden="true" />
              <span>MK {balance.toLocaleString()}</span>
            </Link>
            <Link className="dash-user-chip" href="/profile" title="Profile">
              <span className="dash-avatar">{initial}</span>
              <span className="dash-user-name">{user?.name}</span>
            </Link>
          </div>
        </header>

        <main className="dash-content">{children}</main>
      </div>

      {/* Mobile drawer close button (floats over open sidebar) */}
      {drawerOpen ? (
        <button
          className="dash-drawer-close"
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        >
          <X size={20} />
        </button>
      ) : null}
    </div>
  );
}
