"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Copy,
  MessageCircle,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { type TransactionData, apiGetTransactions } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MW", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function WalletPage() {
  const { user, token, balance, loading: authLoading } = useAuth();
  const router = useRouter();
  const [txns, setTxns] = useState<TransactionData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGetTransactions(token);
      setTxns(data.transactions);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user && token) {
      fetchData();
      setLoaded(true);
    }
  }, [user, token, authLoading, router, fetchData]);

  const settings = getSettings();
  const sortedTxns = [...txns]
    .filter((t) => t.type === "fund" || t.type === "send" || t.type === "bill")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const whatsappMsg = encodeURIComponent(
    `Hi, I want to fund my wallet.\n\nName: ${user?.name}\nAmount: MK \nPayment method: \nTransaction reference:`
  );

  if (!loaded) {
    return (
      <main>
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="loading-skeleton">
              <div className="skeleton-line skeleton-eyebrow" />
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-text" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Wallet</p>
          <h1>Your digital wallet</h1>
          <p>Check your balance and fund your wallet via mobile money.</p>
        </div>
      </section>

      <section className="section" aria-label="Wallet overview">
        <div className="wallet-overview">
          <div className="wallet-balance-card">
            <span className="wallet-balance-label">Available balance</span>
            <strong className="wallet-balance-amount">{formatCurrency(balance)}</strong>
            <div className="wallet-balance-actions">
              <Link className="button button-primary" href="/transfer">
                <ArrowRight size={17} />
                Send money
              </Link>
            </div>
          </div>
          <div className="wallet-quick-links">
            <Link className="wallet-quick-link" href="/transfer">
              <Smartphone size={22} />
              <strong>Send Money</strong>
              <span>Transfer to mobile wallets</span>
            </Link>
            <Link className="wallet-quick-link" href="/pay">
              <Banknote size={22} />
              <strong>Pay Bills</strong>
              <span>Zuku, ESCOM, GOtv & more</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="fund-title">
        <div className="wallet-fund-layout">
          <div className="auth-card">
            <strong className="auth-form-title" id="fund-title">How to fund your wallet</strong>
            <p className="wallet-fund-text">
              Funding is done via mobile money. Send your payment to one of our numbers, then contact us on WhatsApp with the details.
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {settings.paymentMethods.map((m) => (
                <div key={m} className="request-note" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Smartphone size={18} />
                  <span><strong>{m}:</strong> {formattedWhatsappNumber}</span>
                </div>
              ))}
            </div>
            <a
              className="button button-primary form-submit"
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: "1.5rem" }}
            >
              <MessageCircle size={18} />
              Fund via WhatsApp
            </a>
          </div>
          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">Steps to fund</strong>
            <ol className="wallet-fund-steps">
              <li>Send money to one of our payment numbers above.</li>
              <li>Take a screenshot of your payment confirmation.</li>
              <li>Click &quot;Fund via WhatsApp&quot; and send us the screenshot &amp; details.</li>
              <li>We verify and credit your wallet within minutes.</li>
            </ol>
          </aside>
        </div>
      </section>

      {sortedTxns.length > 0 ? (
        <section className="section" aria-labelledby="wallet-history-title">
          <div className="section-heading">
            <p className="eyebrow">History</p>
            <h2 id="wallet-history-title">Recent activity</h2>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTxns.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.created_at)}</td>
                    <td className="dash-type">{t.type}</td>
                    <td className="dash-desc">{t.description}</td>
                    <td className="dash-amount">{formatCurrency(t.amount)}</td>
                    <td>
                      <span className={`dash-badge ${t.status === "completed" ? "badge-completed" : "badge-pending"}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
