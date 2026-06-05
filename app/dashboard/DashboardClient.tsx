"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Loader2,
  MessageCircle,
  Search,
  TrendingUp,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  type TransactionData,
  apiGetTransactions,
} from "@/lib/api";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

const PER_PAGE = 10;

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

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "Pending", icon: Clock3, className: "badge-pending" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "badge-confirmed" },
  processing: { label: "Processing", icon: Loader2, className: "badge-processing" },
  completed: { label: "Completed", icon: CheckCircle2, className: "badge-completed" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "badge-cancelled" },
};

const statusFlow = ["pending", "confirmed", "processing", "completed"] as const;

function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="dash-timeline-cancelled">
        <XCircle size={14} />
        <span>Cancelled</span>
      </div>
    );
  }
  const currentIdx = statusFlow.indexOf(status as typeof statusFlow[number]);
  if (currentIdx < 0) return null;
  return (
    <div className="dash-timeline">
      {statusFlow.map((s, i) => {
        const done = i <= currentIdx;
        const now = i === currentIdx;
        return (
          <div key={s} className={`dash-timeline-step ${done ? "done" : ""} ${now ? "now" : ""}`}>
            <div className="dash-timeline-dot" />
            <span className="dash-timeline-label">{statusConfig[s].label}</span>
            {i < statusFlow.length - 1 ? <div className="dash-timeline-line" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function DetailModal({
  txn,
  onClose,
}: {
  txn: TransactionData;
  onClose: () => void;
}) {
  const StatusIcon = statusConfig[txn.status]?.icon || Clock3;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}><X size={20} /></button>
        <strong className="auth-form-title">Transaction details</strong>

        <div className="dash-detail-grid">
          <div className="dash-detail-field">
            <span>Reference</span>
            <strong>{txn.reference}</strong>
          </div>
          <div className="dash-detail-field">
            <span>Type</span>
            <strong className="dash-type">{txn.type}</strong>
          </div>
          <div className="dash-detail-field">
            <span>Status</span>
            <span className={`dash-badge ${statusConfig[txn.status]?.className || "badge-pending"}`}>
              <StatusIcon size={13} />
              {statusConfig[txn.status]?.label || txn.status}
            </span>
          </div>
          <div className="dash-detail-field">
            <span>Amount</span>
            <strong>{formatCurrency(txn.amount)}</strong>
          </div>
          <div className="dash-detail-field">
            <span>Fee</span>
            <strong>{formatCurrency(txn.fee)}</strong>
          </div>
          <div className="dash-detail-field">
            <span>Total charged</span>
            <strong>{formatCurrency(txn.amount + txn.fee)}</strong>
          </div>
          <div className="dash-detail-field">
            <span>Payout</span>
            <strong>{formatCurrency(txn.payout)}</strong>
          </div>
          <div className="dash-detail-field">
            <span>Date</span>
            <strong>{formatDate(txn.created_at)}</strong>
          </div>
          {txn.country ? (
            <div className="dash-detail-field">
              <span>Country</span>
              <strong>{txn.country}</strong>
            </div>
          ) : null}
          {txn.recipient_name ? (
            <div className="dash-detail-field">
              <span>Recipient</span>
              <strong>{txn.recipient_name}</strong>
            </div>
          ) : null}
          {txn.wallet_type ? (
            <div className="dash-detail-field">
              <span>Wallet</span>
              <strong>{txn.wallet_type}</strong>
            </div>
          ) : null}
          {txn.recipient_number ? (
            <div className="dash-detail-field">
              <span>Mobile</span>
              <strong>{txn.recipient_number}</strong>
            </div>
          ) : null}
        </div>

        <div className="dash-detail-desc">
          <span>Description</span>
          <p>{txn.description}</p>
        </div>

        <StatusTimeline status={txn.status} />
      </div>
    </div>
  );
}

export function DashboardClient() {
  const { user, token, balance, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [allTransactions, setAllTransactions] = useState<TransactionData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [page, setPage] = useState(1);
  const [detailTxn, setDetailTxn] = useState<TransactionData | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGetTransactions(token);
      setAllTransactions(data.transactions);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user && token) {
      fetchTransactions();
      setLoaded(true);
    }
  }, [user, token, authLoading, router, fetchTransactions]);

  const filtered = useMemo(() => {
    let list = allTransactions;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.reference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.recipient_name && t.recipient_name.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    return list;
  }, [allTransactions, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);

  const totalSent = allTransactions
    .filter((t) => t.type === "send" && t.status !== "cancelled")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = allTransactions
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.fee, 0);

  const completedCount = allTransactions.filter((t) => t.status === "completed").length;
  const pendingCount = allTransactions.filter((t) => t.status === "pending" || t.status === "processing").length;

  function exportCSV() {
    const headers = ["ID", "Reference", "Date", "Type", "Description", "Amount (MWK)", "Fee (MWK)", "Payout (MWK)", "Status", "Country", "Recipient", "Wallet", "Number"];
    const rows = filtered.map((t) =>
      [t.id, t.reference, t.created_at, t.type, `"${t.description}"`, t.amount, t.fee, t.payout, t.status, t.country || "", t.recipient_name || "", t.wallet_type || "", t.recipient_number || ""].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swiftmint-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!loaded || fetching) {
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

  const typeOptions = [
    { value: "all", label: "All" },
    { value: "send", label: "Send" },
    { value: "fund", label: "Fund" },
    { value: "bill", label: "Bill" },
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Dashboard</p>
          <h1>Your SwiftMint account</h1>
          <p>
            Welcome back, {user?.name}. Check your balance, view transactions,
            and manage your transfers.
          </p>
        </div>
      </section>

      <section className="section" aria-label="Dashboard summary">
        <div className="dash-stats">
          <div className="dash-stat-card dash-balance-card">
            <span className="stat-icon"><Wallet size={22} /></span>
            <strong className="stat-value">{formatCurrency(balance)}</strong>
            <span className="stat-label">Wallet balance</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><TrendingUp size={22} /></span>
            <strong className="stat-value">{formatCurrency(totalSent)}</strong>
            <span className="stat-label">Total sent</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><Banknote size={22} /></span>
            <strong className="stat-value">{formatCurrency(totalFees)}</strong>
            <span className="stat-label">Total fees paid</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><CheckCircle2 size={22} /></span>
            <strong className="stat-value">{completedCount}</strong>
            <span className="stat-label">Completed</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><Clock3 size={22} /></span>
            <strong className="stat-value">{pendingCount}</strong>
            <span className="stat-label">Active</span>
          </div>
        </div>

        <div className="dash-actions">
          <Link className="button button-primary" href="/transfer">
            <ArrowRight size={17} />
            Send money
          </Link>
          <Link className="button button-secondary" href="/wallet">
            <Wallet size={17} />
            Fund wallet
          </Link>
          <Link className="button button-secondary" href="/pay">
            <Banknote size={17} />
            Pay bills
          </Link>
          {isAdmin ? (
            <Link className="button admin-link" href="/admin">
              <ShieldCheck size={17} />
              Admin
            </Link>
          ) : null}
          {filtered.length > 0 ? (
            <button className="button button-secondary" type="button" onClick={exportCSV}>
              <Download size={17} />
              Export CSV
            </button>
          ) : null}
        </div>

        {allTransactions.length === 0 ? (
          <div className="dash-empty">
            <Wallet size={40} />
            <strong>No transactions yet</strong>
            <p>You received MK 20,000 as a welcome bonus. Start by sending money or funding your wallet.</p>
            <Link className="button button-primary" href="/transfer">Send money now</Link>
          </div>
        ) : (
          <>
            <div className="dash-controls">
              <div className="dash-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by reference, description, recipient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search ? (
                  <button className="dash-search-clear" type="button" onClick={() => setSearch("")}>
                    <X size={16} />
                  </button>
                ) : null}
              </div>
              <div className="dash-filters">
                <Filter size={15} />
                {typeOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={`dash-filter-btn ${typeFilter === o.value ? "active" : ""}`}
                    onClick={() => setTypeFilter(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
                <div className="dash-filter-divider" />
                {statusOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={`dash-filter-btn ${statusFilter === o.value ? "active" : ""}`}
                    onClick={() => setStatusFilter(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <span className="dash-count">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => {
                    const cfg = statusConfig[t.status];
                    const StatusIcon = cfg?.icon || Clock3;
                    return (
                      <tr key={t.id} className="dash-row-clickable" onClick={() => setDetailTxn(t)}>
                        <td className="dash-ref">{t.reference}</td>
                        <td>{formatDate(t.created_at)}</td>
                        <td className="dash-type">{t.type}</td>
                        <td className="dash-desc">{t.description}</td>
                        <td className="dash-amount">{formatCurrency(t.amount)}</td>
                        <td className="dash-fee">{formatCurrency(t.fee)}</td>
                        <td>
                          <span className={`dash-badge ${cfg?.className || "badge-pending"}`}>
                            <StatusIcon size={13} />
                            {cfg?.label || t.status}
                          </span>
                        </td>
                        <td>
                          <button className="dash-action-btn" title="View details" type="button"
                            onClick={(e) => { e.stopPropagation(); setDetailTxn(t); }}>
                            <Search size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="dash-card-list">
              {paginated.map((t) => {
                const cfg = statusConfig[t.status];
                const StatusIcon = cfg?.icon || Clock3;
                return (
                  <div key={t.id} className="dash-mobile-card" onClick={() => setDetailTxn(t)}>
                    <div className="dash-mobile-card-row">
                      <span className="dash-ref">{t.reference}</span>
                      <span className={`dash-badge ${cfg?.className || "badge-pending"}`}>
                        <StatusIcon size={12} />
                        {cfg?.label || t.status}
                      </span>
                    </div>
                    <div className="dash-mobile-card-row">
                      <span className="dash-type">{t.type}</span>
                      <span className="dash-amount">{formatCurrency(t.amount)}</span>
                    </div>
                    <div className="dash-mobile-card-row dash-mobile-card-desc">
                      <span>{t.description}</span>
                    </div>
                    <div className="dash-mobile-card-row">
                      <span className="dash-mobile-card-date">{formatDate(t.created_at)}</span>
                      <span className="dash-mobile-card-fee">Fee: {formatCurrency(t.fee)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 ? (
              <div className="dash-pagination">
                <button className="button button-secondary" type="button" disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}>
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="dash-pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} type="button"
                      className={`dash-page-btn ${p === safePage ? "active" : ""}`}
                      onClick={() => setPage(p)}>
                      {p}
                    </button>
                  ))}
                </div>
                <button className="button button-secondary" type="button" disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}>
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="info-band" aria-labelledby="dash-help">
        <MessageCircle size={26} />
        <div>
          <h2 id="dash-help">Need help?</h2>
          <p>
            Contact SwiftMint on WhatsApp at {formattedWhatsappNumber} for
            assistance with your account or transactions.
          </p>
        </div>
      </section>

      {detailTxn ? (
        <DetailModal
          txn={detailTxn}
          onClose={() => setDetailTxn(null)}
        />
      ) : null}
    </main>
  );
}