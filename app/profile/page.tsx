"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Save, ArrowLeft, User, Smartphone, AtSign, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";

const API_BASE = (() => {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  return v || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");
})();

export default function ProfilePage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (!initialised) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setUsername(user.username || "");
      setInitialised(true);
    }
  }, [user, loading, router, initialised]);

  if (loading) {
    return (
      <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="spin" size={24} />
      </main>
    );
  }

  if (!user) return null;

  const isIncomplete = !user.phone || !user.username;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) { setError("Enter your full name."); return; }
    if (!phone.trim()) { setError("Enter your phone number."); return; }
    if (!username.trim()) { setError("Choose a username."); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          username: username.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && (data.detail || data.message)) ||
          `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccess("Profile updated successfully.");
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Profile</p>
          <h1>Your profile</h1>
          <p>Manage your personal information and account settings.</p>
        </div>
      </section>

      <section className="section">
        <div className="auth-layout auth-layout-center">
          <div className="auth-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              {isIncomplete ? (
                <div className="form-error" style={{ marginBottom: 16 }}>
                  Please complete your profile — some required fields are missing.
                </div>
              ) : null}

              <strong className="auth-form-title">
                {isIncomplete ? "Complete your profile" : "Edit profile"}
              </strong>

              {error ? <div className="form-error">{error}</div> : null}
              {success ? <div className="form-success">{success}</div> : null}

              <div className="form-grid">
                <label>
                  <User size={16} />
                  <span>Full name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </label>
                <label>
                  <AtSign size={16} />
                  <span>Username</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="janedoe"
                    autoComplete="username"
                  />
                </label>
              </div>

              <label>
                <Smartphone size={16} />
                <span>Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+265 888 000 000"
                  autoComplete="tel"
                />
              </label>

              <div className="form-note">
                <Mail size={16} />
                <span>Your email (<strong>{user.email}</strong>) is verified and cannot be changed.</span>
              </div>

              <button
                className="button button-primary form-submit"
                type="submit"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <Loader2 className="spin" size={19} />
                ) : (
                  <Save size={18} />
                )}
                {submitting
                  ? "Saving..."
                  : isIncomplete
                    ? "Save & continue"
                    : "Save changes"}
              </button>

              <p className="auth-alt">
                <Link href="/dashboard">
                  <ArrowLeft size={16} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Back to Dashboard
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
