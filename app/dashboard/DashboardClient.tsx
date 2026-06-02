"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Download,
  Globe2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Smartphone,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { countries, formattedWhatsappNumber } from "@/lib/swiftmint";

type TransferRecord = {
  id: string;
  date: string;
  country: string;
  recipientName: string;
  walletType: string;
  amount: string;
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  fee: number;
  payout: number;
};

const STORAGE_KEY = "swiftmint-transfers";

function loadTransfers(): TransferRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TransferRecord[]) : [];
  } catch {
    return [];
  }
}

function saveTransfers(records: TransferRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

function generateId(): string {
  return `SM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
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

const statusConfig: Record<
  TransferRecord["status"],
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: { label: "Pending", icon: Clock3, className: "badge-pending" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "badge-confirmed" },
  processing: { label: "Processing", icon: Loader2, className: "badge-processing" },
  completed: { label: "Completed", icon: CheckCircle2, className: "badge-completed" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "badge-cancelled" },
};

export function DashboardClient() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    country: "Kenya",
    recipientName: "",
    walletType: "M-Pesa",
    amount: "",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTransfers(loadTransfers());
    setLoaded(true);
  }, []);

  const selectedCountry = countries.find((c) => c.name === form.country);
  const selectedWallets = selectedCountry?.wallets ?? [];
  const sortedTransfers = [...transfers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalSent = transfers
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalFees = transfers
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.fee, 0);

  const completedCount = transfers.filter((t) => t.status === "completed").length;
  const pendingCount = transfers.filter((t) => t.status === "pending" || t.status === "processing").length;

  function addTransfer(record: TransferRecord) {
    const updated = [...transfers, record];
    setTransfers(updated);
    saveTransfers(updated);
  }

  function updateStatus(id: string, status: TransferRecord["status"]) {
    const updated = transfers.map((t) => (t.id === id ? { ...t, status } : t));
    setTransfers(updated);
    saveTransfers(updated);
  }

  function removeTransfer(id: string) {
    const updated = transfers.filter((t) => t.id !== id);
    setTransfers(updated);
    saveTransfers(updated);
  }

  function handleAddTransfer(e: React.FormEvent) {
    e.preventDefault();

    const numAmount = Number(form.amount);
    if (!numAmount || numAmount <= 0) return;

    const STANDARD_RATE = 0.06;
    const VIP_RATE = 0.035;
    const MIN_FEE = 5000;
    const VIP_THRESHOLD = 300000;

    const isVip = numAmount >= VIP_THRESHOLD;
    const rawFee = numAmount * (isVip ? VIP_RATE : STANDARD_RATE);
    const fee = Math.max(rawFee, MIN_FEE);

    addTransfer({
      id: generateId(),
      date: new Date().toISOString(),
      country: form.country,
      recipientName: form.recipientName || "Unnamed",
      walletType: form.walletType,
      amount: String(numAmount),
      status: "pending",
      fee: Math.round(fee),
      payout: Math.round(numAmount - fee),
    });

    setForm({ country: "Kenya", recipientName: "", walletType: "M-Pesa", amount: "" });
    setShowForm(false);
  }

  function exportCSV() {
    const headers = ["ID", "Date", "Country", "Recipient", "Wallet", "Amount (MWK)", "Fee (MWK)", "Payout (MWK)", "Status"];
    const rows = sortedTransfers.map((t) =>
      [t.id, t.date, t.country, t.recipientName, t.walletType, t.amount, t.fee, t.payout, t.status].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swiftmint-transfers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <p className="eyebrow">Dashboard</p>
          <h1>Your transfer history</h1>
          <p>
            Track all your SwiftMint transfer requests, payment status, and income records
            in one place.
          </p>
        </div>
      </section>

      <section className="section" aria-label="Dashboard summary">
        <div className="dash-stats">
          <div className="dash-stat-card">
            <span className="stat-icon">
              <TrendingUp size={22} aria-hidden="true" />
            </span>
            <strong className="stat-value">{formatCurrency(totalSent)}</strong>
            <span className="stat-label">Total sent</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon">
              <Wallet size={22} aria-hidden="true" />
            </span>
            <strong className="stat-value">{formatCurrency(totalFees)}</strong>
            <span className="stat-label">Total fees paid</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon">
              <CheckCircle2 size={22} aria-hidden="true" />
            </span>
            <strong className="stat-value">{completedCount}</strong>
            <span className="stat-label">Completed</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon">
              <Clock3 size={22} aria-hidden="true" />
            </span>
            <strong className="stat-value">{pendingCount}</strong>
            <span className="stat-label">Active</span>
          </div>
        </div>

        <div className="dash-actions">
          <button className="button button-primary" type="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Record a transfer"}
          </button>
          {transfers.length > 0 ? (
            <button className="button button-secondary" type="button" onClick={exportCSV}>
              <Download size={17} aria-hidden="true" />
              Export CSV
            </button>
          ) : null}
          <Link className="button button-secondary" href="/pay">
            <Banknote size={17} aria-hidden="true" />
            Make a payment
          </Link>
        </div>

        {showForm ? (
          <form className="dash-form" onSubmit={handleAddTransfer}>
            <strong>Record a transfer request</strong>
            <div className="dash-form-grid">
              <label>
                <span>Country</span>
                <select
                  value={form.country}
                  onChange={(e) => {
                    const next = countries.find((c) => c.name === e.target.value);
                    setForm({
                      ...form,
                      country: e.target.value,
                      walletType: next?.wallets[0] ?? form.walletType,
                    });
                  }}
                >
                  {countries.map((c) => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Wallet</span>
                <select
                  value={form.walletType}
                  onChange={(e) => setForm({ ...form, walletType: e.target.value })}
                >
                  {selectedWallets.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Recipient name</span>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                  placeholder="e.g. Grace Mwangi"
                />
              </label>
              <label>
                <span>Amount (MWK)</span>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 100000"
                />
              </label>
            </div>
            <button className="button button-primary" type="submit">
              <Smartphone size={17} aria-hidden="true" />
              Save transfer record
            </button>
          </form>
        ) : null}

        {sortedTransfers.length === 0 ? (
          <div className="dash-empty">
            <MessageCircle size={40} aria-hidden="true" />
            <strong>No transfers recorded yet</strong>
            <p>Click "Record a transfer" to add your first transfer request.</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Country</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedTransfers.map((t) => {
                  const StatusIcon = statusConfig[t.status].icon;
                  return (
                    <tr key={t.id}>
                      <td className="dash-id">{t.id}</td>
                      <td>{formatDate(t.date)}</td>
                      <td>
                        <span className="dash-country">{t.country}</span>
                      </td>
                      <td>{t.recipientName}</td>
                      <td className="dash-amount">{formatCurrency(Number(t.amount))}</td>
                      <td className="dash-fee">{formatCurrency(t.fee)}</td>
                      <td>
                        <span className={`dash-badge ${statusConfig[t.status].className}`}>
                          <StatusIcon size={13} aria-hidden="true" />
                          {statusConfig[t.status].label}
                        </span>
                      </td>
                      <td>
                        <div className="dash-row-actions">
                          {t.status === "pending" ? (
                            <>
                              <button
                                className="dash-action-btn"
                                title="Mark confirmed"
                                type="button"
                                onClick={() => updateStatus(t.id, "confirmed")}
                              >
                                <CheckCircle2 size={15} />
                              </button>
                              <button
                                className="dash-action-btn dash-action-danger"
                                title="Cancel"
                                type="button"
                                onClick={() => updateStatus(t.id, "cancelled")}
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          ) : null}
                          {t.status === "confirmed" ? (
                            <button
                              className="dash-action-btn"
                              title="Mark processing"
                              type="button"
                              onClick={() => updateStatus(t.id, "processing")}
                            >
                              <Loader2 size={15} />
                            </button>
                          ) : null}
                          {t.status === "processing" ? (
                            <button
                              className="dash-action-btn"
                              title="Mark completed"
                              type="button"
                              onClick={() => updateStatus(t.id, "completed")}
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          ) : null}
                          {t.status === "completed" || t.status === "cancelled" ? (
                            <button
                              className="dash-action-btn dash-action-danger"
                              title="Delete"
                              type="button"
                              onClick={() => removeTransfer(t.id)}
                            >
                              <XCircle size={15} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="info-band" aria-labelledby="dash-help">
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2 id="dash-help">Need help with a transfer?</h2>
          <p>
            Contact SwiftMint on WhatsApp at {formattedWhatsappNumber} for status
            updates or questions about your requests.
          </p>
        </div>
      </section>
    </main>
  );
}
