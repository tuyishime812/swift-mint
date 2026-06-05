"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function HomeActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="hero-actions" aria-label="SwiftMint primary actions">
        <div className="skeleton-line" style={{ width: 180, height: 50, borderRadius: 10 }} />
      </div>
    );
  }

  return (
    <div className="hero-actions" aria-label="SwiftMint primary actions">
      <Link className="button button-primary" href="/transfer">
        <MessageCircle size={19} aria-hidden="true" />
        Send money now
      </Link>
      {user ? (
        <Link className="button button-secondary" href="/dashboard">
          <ArrowRight size={19} aria-hidden="true" />
          Dashboard
        </Link>
      ) : (
        <Link className="button button-secondary" href="/signup">
          Sign up
        </Link>
      )}
    </div>
  );
}
