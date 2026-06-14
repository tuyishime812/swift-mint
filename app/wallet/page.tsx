"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  MessageCircle,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { type TransactionData, apiGetTransactions } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";
import { DashboardShell } from "@/components/DashboardShell";

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

  const totalFunded = txns
    .filter((t) => t.type === "fund" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSent = txns
    .filter((t) => t.type === "send" && t.status !== "cancelled")
    .reduce((sum, t) => sum + t.amount, 0);

  const whatsappMsg = encodeURIComponent(
    `Hi, I want to fund my wallet.\n\nName: ${user?.name}\nAmount: MK \nPayment method: \nTransaction reference:`
  );

  if (!loaded) {
    return (
      <DashboardShell title="Wallet">
        <div className="dash-stats">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dash-stat-card dash-skeleton-card" aria-hidden="true" />
          ))}
        </div>
        <div className="dash-panel">
          <div className="loading-skeleton">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Wallet" subtitle="Check your balance and fund your wallet via mobile money">
      {/* Summary stats */}
      <div className="dash-stats" aria-label="Wallet summary">
        <div className="dash-stat-card dash-balance-card">
          <span className="stat-icon"><Wallet size={22} /></span>
          <strong className="stat-value">{formatCurrency(balance)}</strong>
          <span className="stat-label">Available balance</span>
        </div>
        <div className="dash-stat-card">
          <span className="stat-icon"><Banknote size={22} /></span>
          <strong className="stat-value">{formatCurrency(totalFunded)}</strong>
          <span className="stat-label">Total funded</span>
        </div>
        <div className="dash-stat-card">
          <span className="stat-icon"><ArrowUpRight size={22} /></span>
          <strong className="stat-value">{formatCurrency(totalSent)}</strong>
          <span className="stat-label">Total sent</span>
        </div>
        <div className="dash-stat-card">
          <span className="stat-icon"><TrendingUp size={22} /></span>
          <strong className="stat-value">{txns.length}</strong>
          <span className="stat-label">Transactions</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="dash-actions">
        <Link className="button button-primary" href="/transfer">
          <ArrowRight size={17} />
          Send money
        </Link>
        <Link className="button button-secondary" href="/pay">
          <Smartphone size={17} />
          Pay bills
        </Link>
        <a
          className="button button-secondary"
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={17} />
          Fund via WhatsApp
        </a>
      </div>

      {/* How to fund */}
      <section className="dash-panel">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title">How to fund your wallet</h2>
        </div>
        <ol className="dash-howto">
          <li>Send money to one of our payment numbers below.</li>
          <li>Take a screenshot of your payment confirmation.</li>
          <li>Click &quot;Fund via WhatsApp&quot; and send us the screenshot &amp; details.</li>
          <li>We verify and credit your wallet within minutes.</li>
        </ol>
        <div className="dash-paynums">
          {settings.paymentMethods.map((m) => (
            <span key={m}>
              <strong>{m}:</strong>{" "}
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">{formattedWhatsappNumber}</a>
            </span>
          ))}
        </div>
        <a
          className="button button-primary"
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: 16 }}
        >
          <MessageCircle size={18} />
          Fund via WhatsApp
        </a>
      </section>

      {/* Recent activity */}
      <section className="dash-panel">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title">Recent activity</h2>
          {sortedTxns.length > 0 ? (
            <Link className="dash-panel-sub" href="/dashboard" style={{ fontWeight: 700 }}>View all</Link>
          ) : null}
        </div>

        {sortedTxns.length === 0 ? (
          <div className="dash-empty">
            <Wallet size={40} />
            <strong>No activity yet</strong>
            <p>Fund your wallet, then send money or pay bills to see your transactions here.</p>
            <a className="button button-primary" href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17} />
              Fund via WhatsApp
            </a>
          </div>
        ) : (
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
                      <span className={`dash-badge ${t.status === "completed" ? "badge-completed" : t.status === "cancelled" ? "badge-cancelled" : "badge-pending"}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
