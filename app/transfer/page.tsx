"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSettings, getWalletOptions, type CountrySetting } from "@/lib/settings";
import { type TransferRequestInput, formattedWhatsappNumber } from "@/lib/swiftmint";
import { apiSendMoney } from "@/lib/api";

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

export default function TransferPage() {
  const { user, token, balance, loading: authLoading } = useAuth();
  const router = useRouter();
  const settings = useMemo(() => getSettings(), []);
  const dynamicCountries = settings.countries;
  const dynamicWalletOptions = getWalletOptions();

  const [form, setForm] = useState<TransferRequestInput>({
    country: dynamicCountries[0]?.name || "Kenya",
    recipientName: "",
    walletType: dynamicCountries[0]?.wallets[0] || "",
    recipientNumber: "",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{
    reference: string; amount: number; fee: number; total: number;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
  }, [user, authLoading, router]);

  const selectedCountryWallets = useMemo(
    () => dynamicCountries.find((c) => c.name === form.country)?.wallets ?? dynamicWalletOptions,
    [form.country, dynamicCountries, dynamicWalletOptions],
  );

  const numAmount = Number(form.amount) || 0;
  const isVip = numAmount >= 300000;
  const rate = isVip ? 0.035 : 0.06;
  const rawFee = numAmount * rate;
  const fee = Math.max(Math.round(rawFee), 5000);
  const total = numAmount + fee;
  const hasBalance = balance >= total;

  function updateField(field: keyof TransferRequestInput, value: string) {
    setForm((current) => {
      if (field === "country") {
        const next = dynamicCountries.find((c) => c.name === value);
        return { ...current, country: value, walletType: next?.wallets[0] ?? current.walletType };
      }
      return { ...current, [field]: value };
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!numAmount || numAmount <= 0) { setError("Enter a valid MWK amount."); return; }
    if (!hasBalance) { setError(`Insufficient balance. You need ${formatCurrency(total)} but have ${formatCurrency(balance)}.`); return; }
    if (!form.recipientName.trim()) { setError("Enter the recipient full name."); return; }
    if (!form.recipientNumber.trim()) { setError("Enter the recipient mobile number."); return; }
    if (!token) { setError("Not authenticated."); return; }

    setIsSubmitting(true);
    try {
      const data = await apiSendMoney(token, {
        country: form.country,
        recipient_name: form.recipientName,
        wallet_type: form.walletType,
        recipient_number: form.recipientNumber,
        amount: numAmount,
      });
      setResult({ reference: data.reference, amount: data.amount, fee: data.fee, total: data.total });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Send money</p>
          <h1>Send mobile wallet payouts</h1>
          <p>
            Transfer money directly to mobile wallets in Kenya, Tanzania, Uganda,
            Zambia, and Ghana.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wallet-fund-layout">
          <div className="auth-card">
            {success && result ? (
              <div className="auth-success">
                <CheckCircle2 size={48} />
                <h2>Transfer submitted!</h2>
                <p>
                  Your transfer of {formatCurrency(result.amount)} to {form.recipientName} in {form.country}
                  has been submitted and is being processed.
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Reference: {result.reference}
                </p>
                <div className="transfer-breakdown">
                  <div><span>Amount</span><strong>{formatCurrency(result.amount)}</strong></div>
                  <div><span>Fee</span><strong>{formatCurrency(result.fee)}</strong></div>
                  <div><span>Total charged</span><strong>{formatCurrency(result.total)}</strong></div>
                </div>
                <div className="transfer-success-actions">
                  <Link className="button button-primary" href="/dashboard">
                    Go to Dashboard
                    <ArrowRight size={18} />
                  </Link>
                  <button className="button button-secondary" type="button" onClick={() => {
                    setSuccess(false);
                    setResult(null);
                    setForm({ country: "Kenya", recipientName: "", walletType: "M-Pesa", recipientNumber: "", amount: "" });
                  }}>
                    <RefreshCw size={16} />
                    Send another
                  </button>
                </div>
              </div>
            ) : (
              <form className="transfer-form-compact" onSubmit={handleSubmit}>
                <strong className="auth-form-title">Send money</strong>

                {error ? <div className="form-error">{error}</div> : null}

                <div className="wallet-balance-hint">
                  <Wallet size={16} />
                  <span>Balance: {formatCurrency(balance)}</span>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Destination country</span>
                    <select value={form.country} onChange={(e) => updateField("country", e.target.value)}>
                      {dynamicCountries.map((c) => (
                        <option key={c.slug} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Mobile wallet</span>
                    <select value={form.walletType} onChange={(e) => updateField("walletType", e.target.value)}>
                      {selectedCountryWallets.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  <span>Recipient full name</span>
                  <input
                    type="text" required
                    value={form.recipientName}
                    onChange={(e) => updateField("recipientName", e.target.value)}
                    placeholder="e.g. Grace Mwangi"
                  />
                </label>

                <label>
                  <span>Recipient mobile number</span>
                  <input
                    type="tel" required
                    value={form.recipientNumber}
                    onChange={(e) => updateField("recipientNumber", e.target.value)}
                    placeholder="e.g. +254 700 000 000"
                  />
                </label>

                <label>
                  <span>Amount to send (MWK)</span>
                  <input
                    type="number" min="1" required
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    placeholder="e.g. 100000"
                  />
                </label>

                {numAmount > 0 ? (
                  <div className="transfer-fee-preview">
                    <div className="transfer-fee-row">
                      <span>Fee ({isVip ? "3.5%" : "6%"})</span>
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

                <button className="button button-primary form-submit" type="submit" disabled={isSubmitting || !hasBalance}>
                  {isSubmitting ? (
                    <Loader2 className="spin" size={19} />
                  ) : (
                    <Globe2 size={19} />
                  )}
                  {isSubmitting ? "Processing..." : "Send money"}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">Transfer summary</strong>
            <div className="sidebar-info-cards">
              <div className="sidebar-info-card">
                <span>Standard fee</span>
                <strong>6%</strong>
              </div>
              <div className="sidebar-info-card">
                <span>VIP fee (MK 300K+)</span>
                <strong>3.5%</strong>
              </div>
              <div className="sidebar-info-card">
                <span>Minimum fee</span>
                <strong>MK 5,000</strong>
              </div>
            </div>
            <p className="auth-sidebar-text">
              Fees are deducted from the total amount. SwiftMint confirms the
              expected payout before processing.
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