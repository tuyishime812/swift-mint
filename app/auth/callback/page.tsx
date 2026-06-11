"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { apiExchangeSupabaseToken } from "@/lib/api";

const TOKEN_KEY = "swiftmint_token";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    async function completeAuth() {
      try {
        const { data: { session } } = await getSupabaseClient().auth.getSession();
        if (!session?.access_token) {
          setError("No session found. Please try again.");
          return;
        }

        const result = await apiExchangeSupabaseToken(session.access_token);
        localStorage.setItem(TOKEN_KEY, result.token);
        window.location.href = "/dashboard";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed.");
      }
    }

    completeAuth();
  }, []);

  if (error) {
    return (
      <main>
        <section className="section" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <h1>Authentication failed</h1>
          <p>{error}</p>
          <a href="/login" className="button button-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>
            Back to login
          </a>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="section" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1>Signing you in...</h1>
        <p>Please wait while we complete the authentication.</p>
      </section>
    </main>
  );
}
