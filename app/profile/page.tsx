"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Save, ArrowLeft, User, Smartphone, AtSign, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";

const API_BASE = (() => {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  return v || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");
})();

// Mirrors the backend rule (USERNAME_RE in models.py): must start with a
// letter/number, then only lowercase letters, numbers, dots, underscores, hyphens.
const USERNAME_RE = /^[a-z0-9][a-z0-9_.-]*$/;
const USERNAME_HINT =
  "Username can only use lowercase letters, numbers, dots, underscores and hyphens — no spaces.";

// FastAPI returns 422 validation errors as a list of objects under `detail`.
// Turn whatever the backend sent into a single readable string.
function extractError(data: unknown, status: number): string {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const msgs = detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : ""))
        .filter(Boolean);
      if (msgs.length) return msgs.join(". ");
    }
  }
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: unknown }).message);
  }
  return `Request failed (${status})`;
}

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
      <DashboardShell title="Profile">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
          <Loader2 className="spin" size={24} />
        </div>
      </DashboardShell>
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
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) { setError("Choose a username."); return; }
    if (!USERNAME_RE.test(cleanUsername)) { setError(USERNAME_HINT); return; }

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
          username: cleanUsername,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(extractError(data, res.status));
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
    <DashboardShell title="Profile" subtitle="Manage your personal information and account settings">
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
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
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
    </DashboardShell>
  );
}
