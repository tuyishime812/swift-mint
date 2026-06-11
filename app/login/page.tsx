"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, LogIn, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";

export default function LoginPage() {
  const { user, login, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) router.push("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!emailOrUsername.trim()) { setError("Enter your email or username."); return; }
    if (!password) { setError("Enter your password."); return; }
    setSubmitting(true);
    try {
      await login(emailOrUsername.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      setGoogleSubmitting(false);
    } catch (err: unknown) {
      setGoogleSubmitting(false);
      setError(err instanceof Error ? err.message : "Google login failed.");
    }
  }

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to SwiftMint</h1>
          <p>Access your wallet, send money, pay bills, and manage your account.</p>
        </div>
      </section>

      <section className="section">
        <div className="auth-layout auth-layout-center">
          <div className="auth-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              <strong className="auth-form-title">Log in to your account</strong>

              {error ? <div className="form-error">{error}</div> : null}

              <label>
                <span>Email or username</span>
                <input type="text" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="you@example.com" autoComplete="username" />
              </label>

              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
              </label>

              <button className="button button-primary form-submit" type="submit" disabled={submitting || googleSubmitting || loading}>
                {submitting ? <Loader2 className="spin" size={19} /> : <LogIn size={18} />}
                {submitting ? "Logging in..." : "Log in"}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button className="button button-secondary form-submit" type="button" onClick={handleGoogleLogin} disabled={submitting || googleSubmitting || loading}>
                {googleSubmitting ? <Loader2 className="spin" size={19} /> : <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
                {googleSubmitting ? "Continuing..." : "Continue with Google"}
              </button>

              <p className="auth-alt">
                Don&apos;t have an account? <Link href="/signup">Sign up</Link>
              </p>
            </form>
          </div>
          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">Need help logging in?</strong>
            <p className="auth-sidebar-text">
              Contact SwiftMint on WhatsApp for assistance with your account.
            </p>
            <div className="request-note">
              <MessageCircle size={20} />
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp: {formattedWhatsappNumber}</a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
