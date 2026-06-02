"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  MessageCircle,
  Smartphone,
  XCircle,
} from "lucide-react";
import { acceptedPaymentMethods, countries, formattedWhatsappNumber, whatsappNumber } from "@/lib/swiftmint";

type PaymentRecord = {
  id: string;
  date: string;
  method: string;
  amount: string;
  reference: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

const STORAGE_KEY = "swiftmint-payments";

function loadPayments(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
  } catch {
    return [];
  }
}

function savePayments(records: PaymentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

const paymentInstructions: Record<string, { steps: string[]; number: string }> = {
  "Airtel Money": {
    number: "*211#",
    steps: [
      "Dial *211# on your Airtel line.",
      "Select 'Send Money'.",
      "Enter the SwiftMint registered number.",
      "Enter the amount and confirm.",
      "Save the confirmation SMS reference.",
    ],
  },
  "TNM Mpamba": {
    number: "*221#",
    steps: [
      "Dial *221# on your TNM line.",
      "Select 'Send Money'.",
      "Enter the recipient number.",
      "Enter the amount and confirm.",
      "Save the confirmation SMS reference.",
    ],
  },
  "National Bank Transfer": {
    number: "SwiftMint Account",
    steps: [
      "Log in to your National Bank mobile app or internet banking.",
      "Select 'Transfer to Mobile Wallet' or 'Send Money'.",
      "Enter SwiftMint account details as provided on WhatsApp.",
      "Enter the amount and confirm.",
      "Save the transaction reference number.",
    ],
  },
};

function generateId(): string {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PayClient() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(acceptedPaymentMethods[0]);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(-1);

  useEffect(() => {
    setPayments(loadPayments());
    setLoaded(true);
  }, []);

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const instructions = paymentInstructions[selectedMethod];

  function addPayment(record: PaymentRecord) {
    const updated = [...payments, record];
    setPayments(updated);
    savePayments(updated);
  }

  function updateStatus(id: string, status: PaymentRecord["status"]) {
    const updated = payments.map((p) => (p.id === id ? { ...p, status } : p));
    setPayments(updated);
    savePayments(updated);
  }

  function removePayment(id: string) {
    const updated = payments.filter((p) => p.id !== id);
    setPayments(updated);
    savePayments(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim() || !amount.trim()) return;

    addPayment({
      id: generateId(),
      date: new Date().toISOString(),
      method: selectedMethod,
      amount,
      reference: reference.trim(),
      status: "pending",
    });

    setReference("");
    setAmount("");
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
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
          <p className="eyebrow">Pay for your transfer</p>
          <h1>Make a payment</h1>
          <p>
            Pay using Airtel Money, TNM Mpamba, or National Bank Transfer. After
            payment, submit your confirmation reference below.
          </p>
          <Link className="button button-primary page-hero-cta" href="/dashboard">
            <ArrowRight size={18} aria-hidden="true" />
            View dashboard
          </Link>
        </div>
      </section>

      <section className="section pay-methods" aria-labelledby="methods-title">
        <div className="section-heading">
          <p className="eyebrow">Payment methods</p>
          <h2 id="methods-title">Choose how to pay</h2>
          <p>
            Select your preferred method and follow the steps to complete payment.
            Then submit your reference below.
          </p>
        </div>

        <div className="pay-tabs">
          {acceptedPaymentMethods.map((method) => (
            <button
              key={method}
              className={`pay-tab ${selectedMethod === method ? "pay-tab-active" : ""}`}
              type="button"
              onClick={() => setSelectedMethod(method)}
            >
              <Smartphone size={17} aria-hidden="true" />
              {method}
            </button>
          ))}
        </div>

        <div className="pay-instructions">
          <div className="pay-instructions-header">
            <strong>How to pay via {selectedMethod}</strong>
            {instructions.number ? (
              <span className="pay-number">
                {instructions.number}
                <button
                  className="pay-copy-btn"
                  type="button"
                  onClick={() => copyToClipboard(instructions.number, -2)}
                  title="Copy"
                >
                  {copiedIndex === -2 ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </span>
            ) : null}
          </div>
          <ol className="pay-steps">
            {instructions.steps.map((step, i) => (
              <li key={i}>
                {step}
                {step.includes("*211#") || step.includes("*221#") ? (
                  <button
                    className="pay-copy-btn"
                    type="button"
                    onClick={() => copyToClipboard(instructions.number, i)}
                    title="Copy code"
                  >
                    {copiedIndex === i ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
          <a
            className="button button-primary"
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`I want to pay for my transfer via ${selectedMethod}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} aria-hidden="true" />
            Get help on WhatsApp
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>

        <form className="pay-form" onSubmit={handleSubmit}>
          <strong>Submit payment confirmation</strong>
          <p>Enter the amount you paid and the reference number from your payment confirmation.</p>
          <div className="pay-form-grid">
            <label>
              <span>Payment method</span>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                {acceptedPaymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Amount paid (MWK)</span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
              />
            </label>
          </div>
          <label>
            <span>Confirmation reference</span>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter the SMS or transaction reference number"
            />
          </label>
          <button className="button button-primary" type="submit">
            <CheckCircle2 size={17} aria-hidden="true" />
            Submit payment record
          </button>
        </form>
      </section>

      {sortedPayments.length > 0 ? (
        <section className="section" aria-labelledby="payment-history-title">
          <div className="section-heading">
            <p className="eyebrow">History</p>
            <h2 id="payment-history-title">Your payment records</h2>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="dash-id">{p.id}</td>
                    <td>{formatDate(p.date)}</td>
                    <td>{p.method}</td>
                    <td className="dash-amount">{formatCurrency(Number(p.amount))}</td>
                    <td className="dash-ref">{p.reference}</td>
                    <td>
                      <span
                        className={`dash-badge ${
                          p.status === "pending"
                            ? "badge-pending"
                            : p.status === "confirmed"
                              ? "badge-confirmed"
                              : p.status === "completed"
                                ? "badge-completed"
                                : "badge-cancelled"
                        }`}
                      >
                        {p.status === "pending" ? <Clock3 size={13} /> : null}
                        {p.status === "confirmed" || p.status === "completed" ? (
                          <CheckCircle2 size={13} />
                        ) : null}
                        {p.status === "cancelled" ? <XCircle size={13} /> : null}
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="dash-row-actions">
                        {p.status === "pending" ? (
                          <>
                            <button
                              className="dash-action-btn"
                              title="Confirm"
                              type="button"
                              onClick={() => updateStatus(p.id, "confirmed")}
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              className="dash-action-btn dash-action-danger"
                              title="Cancel"
                              type="button"
                              onClick={() => updateStatus(p.id, "cancelled")}
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        ) : null}
                        {p.status === "confirmed" ? (
                          <button
                            className="dash-action-btn"
                            title="Complete"
                            type="button"
                            onClick={() => updateStatus(p.id, "completed")}
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        ) : null}
                        {p.status === "completed" || p.status === "cancelled" ? (
                          <button
                            className="dash-action-btn dash-action-danger"
                            title="Delete"
                            type="button"
                            onClick={() => removePayment(p.id)}
                          >
                            <XCircle size={15} />
                          </button>
                        ) : null}
                      </div>
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
