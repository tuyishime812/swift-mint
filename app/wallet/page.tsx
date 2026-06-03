"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  type TransactionData,
  apiFundWallet,
  apiGetTransactions,
} from "@/lib/api";
import { acceptedPaymentMethods, formattedWhatsappNumber } from "@/lib/swiftmint";

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MW", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function WalletPage() {
  const { user, token, balance, loading: authLoading, refreshBalance } = useAuth();
  const router = useRouter();
  const [txns, setTxns] = useState<TransactionData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [fundMethod, setFundMethod] = useState(acceptedPaymentMethods[0]);
  const [funding, setFunding] = useState(false);
  const [fundDone, setFundDone] = useState(false);
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

  async function handleFund(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(fundAmount);
    if (!amount || amount <= 0) return;
    if (!token) return;
    setFunding(true);
    try {
      await apiFundWallet(token, amount, fundMethod);
      await refreshBalance();
      await fetchData();
      setFundDone(true);
      setFundAmount("");
      setTimeout(() => setFundDone(false), 3000);
    } catch {
      // ignore
    } finally {
      setFunding(false);
    }
  }

  const sortedTxns = [...txns]
    .filter((t) => t.type === "fund" || t.type === "send" || t.type === "bill")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const copyRef = user?.id || "";

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
          <p className="eyebrow">SwiftMint Wallet</p>
          <h1>Your digital wallet</h1>
          <p>Fund your wallet, send money, pay bills, and track everything in one place.</p>
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
              <button className="button button-secondary" type="button"
                onClick={() => document.getElementById("fund-form")?.scrollIntoView({ behavior: "smooth" })}>
                <TrendingUp size={17} />
                Fund wallet
              </button>
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

      <section className="section" aria-labelledby="fund-title" id="fund-form">
        <div className="wallet-fund-layout">
          <div className="auth-card">
            <strong className="auth-form-title">Fund your wallet</strong>
            <p className="wallet-fund-text">
              Choose an amount and payment method to add funds to your SwiftMint Wallet.
            </p>
            {fundDone ? (
              <div className="auth-success">
                <CheckCircle2 size={40} />
                <h3>Wallet funded!</h3>
                <p>Your balance has been updated.</p>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleFund}>
                <label>
                  <span>Amount (MWK)</span>
                  <input
                    type="number" min="1000" step="1000" required
                    placeholder="e.g. 50000"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                  />
                </label>
                <label>
                  <span>Payment method</span>
                  <select value={fundMethod} onChange={(e) => setFundMethod(e.target.value)}>
                    {acceptedPaymentMethods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <button className="button button-primary form-submit" type="submit" disabled={funding}>
                  {funding ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
                  {funding ? "Processing..." : "Fund wallet"}
                </button>
              </form>
            )}
          </div>
          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">How to fund</strong>
            <ol className="wallet-fund-steps">
              <li>Enter the amount you want to add.</li>
              <li>Select your preferred payment method.</li>
              <li>Click &quot;Fund wallet&quot; to complete.</li>
              <li>Funds are added to your balance instantly.</li>
            </ol>
            <div className="request-note">
              <MessageCircle size={20} />
              <span>WhatsApp: {formattedWhatsappNumber}</span>
            </div>
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