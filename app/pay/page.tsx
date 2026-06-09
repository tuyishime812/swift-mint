"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Monitor,
  Smartphone,
  Tv,
  Wallet,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { billers } from "@/lib/billers";
import { apiPayBill } from "@/lib/api";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

function createIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const billerIcon = (id: string): React.ElementType => {
  const map: Record<string, React.ElementType> = {
    zuku: Monitor, esco: Zap, airtel: Smartphone, tnm: Smartphone, water: Zap, gotv: Tv,
  };
  return map[id] || Smartphone;
};

export default function PayPage() {
  const { user, token, balance, loading: authLoading, refreshBalance } = useAuth();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState(billers[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{
    reference: string; amount: number; fee: number; total: number;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) setLoaded(true);
  }, [user, authLoading, router]);

  const numAmount = Number(amount) || 0;
  const fee = Math.round(numAmount * 0.02);
  const total = numAmount + fee;
  const hasBalance = balance >= total;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!numAmount || numAmount <= 0) { setError("Enter a valid amount."); return; }
    if (!accountNumber.trim()) { setError("Enter your account number."); return; }
    if (!hasBalance) { setError(`Insufficient balance. You need ${formatCurrency(total)}.`); return; }
    if (!token) { setError("Not authenticated."); return; }

    setSubmitting(true);
    try {
      const data = await apiPayBill(token, {
        biller: selectedBiller.name,
        account_number: accountNumber.trim(),
        amount: Math.round(numAmount),
      }, createIdempotencyKey("bill"));
      setResult({ reference: data.reference, amount: data.amount, fee: data.fee, total: data.total });
      setSuccess(true);
      await refreshBalance();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <p className="eyebrow">Pay bills</p>
          <h1>Pay your bills with SwiftMint</h1>
          <p>
            Pay Zuku TV, ESCOM electricity, airtime, and more directly from your
            SwiftMint Wallet.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wallet-fund-layout">
          <div className="auth-card">
            {success && result ? (
              <div className="auth-success">
                <CheckCircle2 size={48} />
                <h2>Payment successful!</h2>
                <p>
                  Your payment of {formatCurrency(result.amount)} to {selectedBiller.name}
                  (Account: {accountNumber}) has been completed.
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Reference: {result.reference}
                </p>
                <div className="transfer-breakdown">
                  <div><span>Amount</span><strong>{formatCurrency(result.amount)}</strong></div>
                  <div><span>Fee (2%)</span><strong>{formatCurrency(result.fee)}</strong></div>
                  <div><span>Total charged</span><strong>{formatCurrency(result.total)}</strong></div>
                </div>
                <div className="transfer-success-actions">
                  <Link className="button button-primary" href="/dashboard">
                    Go to Dashboard
                  </Link>
                  <button className="button button-secondary" type="button" onClick={() => {
                    setSuccess(false);
                    setResult(null);
                    setAccountNumber("");
                    setAmount("");
                  }}>
                    Pay another bill
                  </button>
                </div>
              </div>
            ) : (
              <form className="transfer-form-compact" onSubmit={handleSubmit}>
                <strong className="auth-form-title">Pay a bill</strong>
                {error ? <div className="form-error">{error}</div> : null}

                <div className="wallet-balance-hint">
                  <Wallet size={16} />
                  <span>Balance: {formatCurrency(balance)}</span>
                </div>

                <label>
                  <span>Select biller</span>
                </label>
                <div className="biller-grid">
                  {billers.map((b) => {
                    const Icon = billerIcon(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className={`biller-card ${selectedBiller.id === b.id ? "biller-card-active" : ""}`}
                        onClick={() => setSelectedBiller(b)}
                      >
                        <Icon size={22} />
                        <span>{b.name}</span>
                      </button>
                    );
                  })}
                </div>

                <label>
                  <span>Account number</span>
                  <input
                    type="text" required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={`Enter your ${selectedBiller.name} account number`}
                  />
                </label>

                <label>
                  <span>Amount (MWK)</span>
                  <input
                    type="number" min="100" required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                </label>

                {numAmount > 0 ? (
                  <div className="transfer-fee-preview">
                    <div className="transfer-fee-row">
                      <span>Fee (2%)</span>
                      <strong>{formatCurrency(fee)}</strong>
                    </div>
                    <div className="transfer-fee-row">
                      <span>Total to charge</span>
                      <strong>{formatCurrency(total)}</strong>
                    </div>
                    {!hasBalance ? (
                      <div className="transfer-insufficient">
                        Insufficient balance. <Link href="/wallet">Fund your wallet</Link>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <button className="button button-primary form-submit" type="submit" disabled={submitting || !hasBalance}>
                  {submitting ? <Loader2 className="spin" size={19} /> : <CheckCircle2 size={19} />}
                  {submitting ? "Processing..." : "Pay now"}
                </button>
              </form>
            )}
          </div>
          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">Supported billers</strong>
            <ul className="auth-benefits">
              {billers.map((b) => (
                <li key={b.id}>{b.name}</li>
              ))}
            </ul>
            <p className="auth-sidebar-text">
              A 2% service fee applies to all bill payments. Minimum payment is
              MK 100.
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
