"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, LogIn, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(phone, password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push("/dashboard");
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
                <span>Phone number</span>
                <input
                  type="tel" required placeholder="+265 888 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="button button-primary form-submit" type="submit" disabled={loading}>
                {loading ? <Loader2 className="spin" size={18} /> : <LogIn size={18} />}
                {loading ? "Logging in..." : "Log in"}
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
              <span>WhatsApp: {formattedWhatsappNumber}</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
