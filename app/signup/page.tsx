"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircle, UserPlus, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await signup({ ...form, email: form.email || `${form.phone}@swiftmint.mw` });
    setLoading(false);
    if (err) { setError(err); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Get started</p>
          <h1>Create your SwiftMint account</h1>
          <p>Send money, pay bills, and manage your transfers — all from one account.</p>
        </div>
      </section>

      <section className="section">
        <div className="auth-layout">
          <div className="auth-card">
            {done ? (
              <div className="auth-success">
                <CheckCircle2 size={48} />
                <h2>Account created!</h2>
                <p>Welcome to SwiftMint Exchange. You received MK 20,000 as a welcome bonus.</p>
                <Link className="button button-primary" href="/dashboard">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                <strong className="auth-form-title">Create your account</strong>
                {error ? <div className="form-error">{error}</div> : null}
                <div className="auth-grid">
                  <label>
                    <span>Full name</span>
                    <input
                      type="text" required placeholder="e.g. John Banda"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Phone number</span>
                    <input
                      type="tel" required placeholder="+265 888 000 000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Email (optional)</span>
                    <input
                      type="email" placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      type="password" required minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </label>
                </div>
                <button className="button button-primary form-submit" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />}
                  {loading ? "Creating account..." : "Create account"}
                </button>
                <p className="auth-alt">
                  Already have an account? <Link href="/login">Log in</Link>
                </p>
              </form>
            )}
          </div>
          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">Why join SwiftMint?</strong>
            <ul className="auth-benefits">
              <li>Get MK 20,000 welcome bonus on signup</li>
              <li>Send mobile wallet payouts to 5+ African countries</li>
              <li>Pay bills directly from your wallet</li>
              <li>Track all your transfers from one dashboard</li>
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
