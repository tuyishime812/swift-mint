"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSettings, type CountrySetting } from "@/lib/settings";
import { type TransferRequestInput, whatsappNumber, formattedWhatsappNumber, countries } from "@/lib/swiftmint";
import { apiSendMoney } from "@/lib/api";
import { fetchFxRates, getFxRate, convertMwK } from "@/lib/fx";

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

export default function TransferPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const settings = useMemo(() => getSettings(), []);
  const dynamicCountries = settings.countries;
  const paymentMethods = settings.paymentMethods;

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
  const [fxRates, setFxRates] = useState<Record<string, number> | null>(null);
  const [fxLoading, setFxLoading] = useState(true);

  useEffect(() => {
    fetchFxRates().then(setFxRates).catch(() => {}).finally(() => setFxLoading(false));
  }, []);
  const [result, setResult] = useState<{
    reference: string; amount: number; fee: number; total: number;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
  }, [user, authLoading, router]);

  const selectedCountryWallets = useMemo(
    () => dynamicCountries.find((c) => c.name === form.country)?.wallets ?? [],
    [form.country, dynamicCountries],
  );

  const numAmount = Number(form.amount) || 0;
  const isVip = numAmount >= 300000;
  const rate = isVip ? 0.035 : 0.06;
  const rawFee = numAmount * rate;
  const fee = Math.max(Math.round(rawFee), 5000);
  const total = numAmount + fee;

  const selectedCountry = useMemo(
    () => countries.find((c) => c.name === form.country),
    [form.country],
  );

  const fxRate = useMemo(
    () => selectedCountry && fxRates ? getFxRate(fxRates, selectedCountry.currency) : 0,
    [selectedCountry, fxRates],
  );

  const localCurrencyPayout = useMemo(
    () => fxRate > 0 ? convertMwK(numAmount - fee, fxRate) : null,
    [numAmount, fee, fxRate],
  );

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

  function buildWhatsAppMessage(): string {
    return [
      "Hello SwiftMint Exchange, I would like to place a transfer order.",
      "",
      `Country: ${form.country}`,
      `Recipient name: ${form.recipientName}`,
      `Wallet type: ${form.walletType}`,
      `Recipient number: ${form.recipientNumber}`,
      `Amount in MWK: ${form.amount}`,
      `Fee: ${formatCurrency(fee)}`,
      `Total to send to your number: ${formatCurrency(total)}`,
    ].join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!numAmount || numAmount <= 0) { setError("Enter a valid MWK amount."); return; }
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
      setError(err instanceof Error ? err.message : "Order submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`;

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Place an order</p>
          <h1>Send mobile wallet payouts</h1>
          <p>
            Send money to our payment number, then submit your order. We confirm
            receipt and process the payout to your recipient.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wallet-fund-layout">
          <div className="auth-card">
            {success && result ? (
              <div className="auth-success">
                <CheckCircle2 size={48} />
                <h2>Order placed!</h2>
                <p>
                  Your order of {formatCurrency(result.amount)} to {form.recipientName} in {form.country}
                  has been submitted and is pending confirmation.
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Reference: {result.reference}
                </p>
                <div className="transfer-breakdown">
                  <div><span>Amount</span><strong>{formatCurrency(result.amount)}</strong></div>
                  <div><span>Fee</span><strong>{formatCurrency(result.fee)}</strong></div>
                  <div><span>Total to pay</span><strong>{formatCurrency(result.total)}</strong></div>
                </div>
                <div className="transfer-success-actions">
                  <Link className="button button-primary" href="/dashboard">
                    Go to Dashboard
                    <ArrowRight size={18} />
                  </Link>
                  <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} />
                    Notify on WhatsApp
                  </a>
                  <button className="button button-secondary" type="button" onClick={() => {
                    setSuccess(false);
                    setResult(null);
                    setForm({ country: "Kenya", recipientName: "", walletType: "M-Pesa", recipientNumber: "", amount: "" });
                  }}>
                    <RefreshCw size={16} />
                    Place another
                  </button>
                </div>
              </div>
            ) : (
              <form className="transfer-form-compact" onSubmit={handleSubmit}>
                <strong className="auth-form-title">Place a transfer order</strong>

                {error ? <div className="form-error">{error}</div> : null}

                <div className="transfer-payment-instructions" style={{ background: "var(--surface)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.85rem" }}>
                  <strong>Step 1: Send money to our number</strong>
                  {paymentMethods.map((m) => (
                    <div key={m} style={{ marginTop: "0.25rem" }}>{m}: <strong>{formattedWhatsappNumber}</strong></div>
                  ))}
                  <div style={{ marginTop: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                    <strong>Step 2: Fill in the order details below</strong>
                  </div>
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
                      <span>Total to send to our number</span>
                      <strong>{formatCurrency(total)}</strong>
                    </div>
                    {selectedCountry && fxRate > 0 && localCurrencyPayout !== null ? (
                      <div className="transfer-fee-row">
                        <span>Est. payout in {selectedCountry.name}</span>
                        <strong>{localCurrencyPayout.toLocaleString("en-MW", { style: "currency", currency: selectedCountry.currency, minimumFractionDigits: 2 })}</strong>
                      </div>
                    ) : fxLoading && selectedCountry ? (
                      <div className="transfer-fee-row">
                        <span>Loading exchange rate...</span>
                        <strong></strong>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <button className="button button-primary form-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="spin" size={19} />
                  ) : (
                    <Smartphone size={19} />
                  )}
                  {isSubmitting ? "Submitting..." : "Place order"}
                  <ArrowRight size={18} />
                </button>

                <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
                  <a className="inline-link" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} />
                    Or place this order on WhatsApp instead
                  </a>
                </div>
              </form>
            )}
          </div>

          <aside className="auth-sidebar">
            <strong className="auth-sidebar-title">How it works</strong>
            <ol className="wallet-fund-steps">
              <li>Send money to our number via {paymentMethods.join(", ")}.</li>
              <li>Fill in the recipient and payout details on this form.</li>
              <li>Submit your order — we confirm receipt and process the payout.</li>
              <li>Track your order status on the dashboard.</li>
            </ol>
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
