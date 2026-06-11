"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Monitor,
  Smartphone,
  Tv,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { billers } from "@/lib/billers";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";
import { getSettings } from "@/lib/settings";

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

function buildWhatsAppMessage(biller: string, account: string, amount: number): string {
  return [
    "Hello SwiftMint Exchange, I would like to pay a bill.",
    "",
    `Biller: ${biller}`,
    `Account number: ${account}`,
    `Amount: MK ${amount.toLocaleString("en-MW")}`,
    "",
    "I have sent the money to your payment number.",
  ].join("\n");
}

const billerIcon = (id: string): React.ElementType => {
  const map: Record<string, React.ElementType> = {
    zuku: Monitor, esco: Zap, airtel: Smartphone, tnm: Smartphone, water: Zap, gotv: Tv,
  };
  return map[id] || Smartphone;
};

export default function PayPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState(billers[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const paymentMethods = getSettings().paymentMethods;

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) { setLoaded(true); }
  }, [user, authLoading, router]);

  const numAmount = Number(amount) || 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!numAmount || numAmount <= 0) { setError("Enter a valid amount."); return; }
    if (!accountNumber.trim()) { setError("Enter your account number."); return; }
    setSubmitting(true);
    setSubmitted(true);
    setSubmitting(false);
  }

  function handleReset() {
    setSubmitted(false);
    setAccountNumber("");
    setAmount("");
    setError("");
  }

  const waMessage = buildWhatsAppMessage(selectedBiller.name, accountNumber.trim(), numAmount);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

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
            Pay Zuku TV, ESCOM electricity, airtime, and more. Send us the money
            and we&apos;ll pay your bill.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wallet-fund-layout">
          <div className="auth-card">
            {submitted ? (
              <div className="pay-instructions">
                <CheckCircle2 size={44} style={{ color: "var(--brand)" }} />
                <h2>Almost done!</h2>
                <p>
                  To pay your <strong>{selectedBiller.name}</strong> bill
                  (Account: <strong>{accountNumber.trim()}</strong>) of{" "}
                  <strong>{formatCurrency(numAmount)}</strong>, follow these steps:
                </p>

                <div className="pay-steps">
                  <div className="pay-step">
                    <span className="pay-step-num">1</span>
                    <div>
                      <strong>Send the money</strong>
                      <p>
                        Send <strong>{formatCurrency(numAmount)}</strong> to any
                        of our payment numbers below.
                      </p>
                    </div>
                  </div>
                  <div className="pay-step">
                    <span className="pay-step-num">2</span>
                    <div>
                      <strong>Contact us on WhatsApp</strong>
                      <p>
                        Tap the button below to send us your bill payment details
                        via WhatsApp so we can process it.
                      </p>
                    </div>
                  </div>
                  <div className="pay-step">
                    <span className="pay-step-num">3</span>
                    <div>
                      <strong>We pay your bill</strong>
                      <p>
                        Once we confirm your payment, we&apos;ll process the bill
                        payment and notify you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pay-methods-list">
                  <strong>Our payment numbers:</strong>
                  {paymentMethods.map((m) => (
                    <div key={m} className="pay-method-item">
                      <span>{m}:</span>
                      <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                        {formattedWhatsappNumber}
                      </a>
                    </div>
                  ))}
                </div>

                <div className="transfer-success-actions">
                  <a
                    className="button button-primary"
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={18} />
                    Confirm on WhatsApp
                  </a>
                  <button className="button button-secondary" type="button" onClick={handleReset}>
                    Start over
                  </button>
                  <Link className="button button-secondary" href="/dashboard">
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form className="transfer-form-compact" onSubmit={handleSubmit}>
                <strong className="auth-form-title">Pay a bill</strong>
                {error ? <div className="form-error">{error}</div> : null}

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

                <div className="pay-note">
                  <MessageCircle size={16} />
                  <span>
                    After submitting, send the money to our payment number and
                    contact us on WhatsApp to confirm.
                  </span>
                </div>

                <button className="button button-primary form-submit" type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="spin" size={19} /> : <ExternalLink size={19} />}
                  Continue
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
              Send us the payment and we&apos;ll handle the rest. A 2% service
              fee applies. Minimum payment is MK 100.
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
