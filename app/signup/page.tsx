"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export default function SignUpPage() {
  const { user, signup, signupWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) router.push("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Enter your full name."); return; }
    if (!email.trim()) { setError("Enter your email address."); return; }
    if (!phone.trim()) { setError("Enter your phone number."); return; }
    if (!username.trim()) { setError("Choose a username."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), phone.trim(), username.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Get started</p>
          <h1>Create your SwiftMint account</h1>
          <p>Place transfer orders, track payouts, and manage your transfers — all from one account.</p>
        </div>
      </section>

      <section className="section">
        <div className="auth-layout">
          <div className="auth-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              <strong className="auth-form-title">Create your account</strong>

              {error ? <div className="form-error">{error}</div> : null}

              <div className="form-grid">
                <label>
                  <span>Full name</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </label>
                <label>
                  <span>Username</span>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="janedoe" autoComplete="username" />
                </label>
              </div>

              <label>
                <span>Email address</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" autoComplete="email" />
              </label>

              <label>
                <span>Phone number</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+265 888 000 000" autoComplete="tel" />
              </label>

              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
              </label>

              <button className="button button-primary form-submit" type="submit" disabled={submitting || loading}>
                {submitting ? <Loader2 className="spin" size={19} /> : <UserPlus size={18} />}
                {submitting ? "Creating account..." : "Create account"}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button className="button button-secondary form-submit" type="button" onClick={signupWithGoogle} disabled={loading}>
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <p className="auth-alt">
                Already have an account? <Link href="/login">Log in</Link>
              </p>
            </form>
          </div>
          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">Why join SwiftMint?</strong>
            <ul className="auth-benefits">
              <li>Send money to our number &mdash; we handle the payout</li>
              <li>Send mobile wallet payouts to 30+ countries</li>
              <li>Place orders via website or WhatsApp</li>
              <li>Track all your orders from one dashboard</li>
              <li>Transparent fees confirmed before processing</li>
            </ul>
            <div className="request-note">
              <MessageCircle size={20} />
              <span>WhatsApp: {formattedWhatsappNumber}</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
