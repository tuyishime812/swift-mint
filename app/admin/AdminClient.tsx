"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Loader2,
  MessageCircle,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  type TransactionData,
  type TestimonialData,
  apiAdminAllTransactions,
  apiAdminAllUsers,
  apiAdminUpdateTransactionStatus,
  apiAdminDeleteTransaction,
  apiAdminUsersWithBalance,
  apiAdminFundUser,
  apiAdminAllTestimonials,
  apiAdminApproveTestimonial,
  apiAdminDeleteTestimonial,
} from "@/lib/api";
import {
  getSettings,
  saveSettings,
  resetSettings,
  type PlatformSettings,
  type CountrySetting,
} from "@/lib/settings";

const PER_PAGE = 15;

function formatCurrency(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MW", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function createIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge-pending" },
  confirmed: { label: "Confirmed", className: "badge-confirmed" },
  processing: { label: "Processing", className: "badge-processing" },
  completed: { label: "Completed", className: "badge-completed" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

type Tab = "transactions" | "users" | "testimonials" | "settings";

export function AdminClient() {
  const { user, token, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("transactions");
  const [allTxns, setAllTxns] = useState<TransactionData[]>([]);
  const [allUsers, setAllUsers] = useState<({ id: string; name: string; phone?: string; email: string; created_at: string } & { balance?: number })[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<TestimonialData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fundError, setFundError] = useState("");
  const [actionError, setActionError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // User fund modal
  const [fundUserId, setFundUserId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);

  // Settings
  const [settings, setSettings] = useState<PlatformSettings>(getSettings());
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [txnRes, userRes, testimonialRes] = await Promise.all([
        apiAdminAllTransactions(token, { limit: 200 }),
        apiAdminUsersWithBalance(token, { limit: 200 }).catch(() => apiAdminAllUsers(token, { limit: 200 })),
        apiAdminAllTestimonials(token).catch(() => ({ testimonials: [] })),
      ]);
      setAllTxns(txnRes.transactions);
      setAllUsers(userRes.users);
      setAllTestimonials(testimonialRes.testimonials);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    if (user && token && isAdmin) fetchData();
  }, [user, token, isAdmin, fetchData]);

  async function handleUpdateStatus(txnId: string, status: string) {
    if (!token) return;
    setActionError("");
    try {
      await apiAdminUpdateTransactionStatus(token, txnId, status);
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleDelete(txnId: string) {
    if (!token || !confirm("Delete this transaction permanently?")) return;
    setActionError("");
    try {
      await apiAdminDeleteTransaction(token, txnId);
      await fetchData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleFundUser(e: React.FormEvent) {
    e.preventDefault();
    setFundError("");
    const amount = Number(fundAmount);
    if (!amount || amount <= 0 || !fundUserId || !token) return;
    setFunding(true);
    try {
      await apiAdminFundUser(token, fundUserId, Math.round(amount), createIdempotencyKey("fund"));
      setFundUserId("");
      setFundAmount("");
      await fetchData();
    } catch (err) {
      setFundError(err instanceof Error ? err.message : "Funding failed");
    }
    finally { setFunding(false); }
  }

  function handleSaveSettings() {
    setSavingSettings(true);
    saveSettings(settings);
    setSettingsMsg("Settings saved successfully.");
    setTimeout(() => setSettingsMsg(""), 3000);
    setSavingSettings(false);
  }

  function handleResetSettings() {
    if (!confirm("Reset all settings to defaults?")) return;
    resetSettings();
    setSettings(getSettings());
    setSettingsMsg("Settings reset to defaults.");
    setTimeout(() => setSettingsMsg(""), 3000);
  }

  function updateCountry(idx: number, field: keyof CountrySetting, value: string | string[]) {
    const updated = { ...settings };
    updated.countries = updated.countries.map((c, i) => i === idx ? { ...c, [field]: value } as CountrySetting : c);
    setSettings(updated);
  }

  function addCountry() {
    const updated = { ...settings };
    updated.countries = [...updated.countries, { slug: "", code: "", name: "", wallets: [], note: "" }];
    setSettings(updated);
  }

  function removeCountry(idx: number) {
    const updated = { ...settings };
    updated.countries = updated.countries.filter((_, i) => i !== idx);
    setSettings(updated);
  }

  const filteredTxn = useMemo(() => {
    let list = allTxns;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.reference.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.recipient_name && t.recipient_name.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    return list;
  }, [allTxns, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTxn.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredTxn.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const stats = useMemo(() => ({
    total: allTxns.length,
    pending: allTxns.filter((t) => t.status === "pending").length,
    processing: allTxns.filter((t) => t.status === "processing").length,
    completed: allTxns.filter((t) => t.status === "completed").length,
    volume: allTxns.filter((t) => t.status !== "cancelled").reduce((s, t) => s + t.amount, 0),
  }), [allTxns]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  if (!authLoading && (!user || !isAdmin)) {
    return (
      <main>
        <section className="page-hero">
          <div className="page-hero-inner">
            <ShieldAlert size={40} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p className="eyebrow">Restricted</p>
            <h1>Admin access only</h1>
            <p>You do not have permission to view this page. Contact your administrator if you need access.</p>
          </div>
        </section>
      </main>
    );
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
          <p className="eyebrow">Admin Panel</p>
          <h1>SwiftMint administration</h1>
          <p>Manage transactions, users, platform settings, and content.</p>
        </div>
      </section>

      <section className="section">
        <div className="dash-stats">
          <div className="dash-stat-card">
            <span className="stat-icon"><Wallet size={22} /></span>
            <strong className="stat-value">{stats.total}</strong>
            <span className="stat-label">Transactions</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><Clock3 size={22} /></span>
            <strong className="stat-value">{stats.pending}</strong>
            <span className="stat-label">Pending</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><Loader2 size={22} /></span>
            <strong className="stat-value">{stats.processing}</strong>
            <span className="stat-label">Processing</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><CheckCircle2 size={22} /></span>
            <strong className="stat-value">{stats.completed}</strong>
            <span className="stat-label">Completed</span>
          </div>
          <div className="dash-stat-card">
            <span className="stat-icon"><Users size={22} /></span>
            <strong className="stat-value">{formatCurrency(stats.volume)}</strong>
            <span className="stat-label">Volume</span>
          </div>
        </div>

        <div className="dash-actions">
          {(["transactions", "users", "testimonials", "settings"] as Tab[]).map((t) => (
            <button key={t}
              className={`button ${tab === t ? "button-primary" : "button-secondary"}`}
              type="button" onClick={() => setTab(t)}>
              {t === "transactions" ? <Wallet size={17} /> : t === "users" ? <Users size={17} /> : t === "testimonials" ? <Star size={17} /> : <Settings size={17} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "transactions" && (
          <>
            <div className="dash-controls">
              {actionError ? <div className="form-error" style={{ marginBottom: 8 }}>{actionError}</div> : null}
              <div className="dash-search">
                <Search size={16} />
                <input type="text" placeholder="Search..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
                {search ? (
                  <button className="dash-search-clear" type="button" onClick={() => setSearch("")}>
                    <X size={16} />
                  </button>
                ) : null}
              </div>
              <div className="dash-filters">
                {["all", "pending", "confirmed", "processing", "completed", "cancelled"].map((s) => (
                  <button key={s} type="button"
                    className={`dash-filter-btn ${statusFilter === s ? "active" : ""}`}
                    onClick={() => setStatusFilter(s)}>
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <span className="dash-count">{filteredTxn.length} txn{filteredTxn.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => {
                    const cfg = statusConfig[t.status] || statusConfig.pending;
                    return (
                      <tr key={t.id}>
                        <td className="dash-ref">{t.reference}</td>
                        <td>{formatDate(t.created_at)}</td>
                        <td>{t.user_id.slice(0, 8)}</td>
                        <td className="dash-type">{t.type}</td>
                        <td className="dash-desc">{t.description}</td>
                        <td className="dash-amount">{formatCurrency(t.amount)}</td>
                        <td>
                          <span className={`dash-badge ${cfg.className}`}>{cfg.label}</span>
                        </td>
                        <td>
                          <div className="dash-row-actions">
                            {t.status === "pending" ? (
                              <>
                                <button className="dash-action-btn dash-action-confirm" title="Mark as confirmed — cash received from sender"
                                  onClick={() => handleUpdateStatus(t.id, "confirmed")}>
                                  <CheckCircle2 size={14} /> Confirm
                                </button>
                                <button className="dash-action-btn dash-action-danger" title="Cancel transaction"
                                  onClick={() => handleUpdateStatus(t.id, "cancelled")}>
                                  <XCircle size={14} /> Cancel
                                </button>
                              </>
                            ) : null}
                            {t.status === "confirmed" ? (
                              <button className="dash-action-btn dash-action-process" title="Mark as processing — forwarding to recipient"
                                onClick={() => handleUpdateStatus(t.id, "processing")}>
                                <Loader2 size={14} /> Process
                              </button>
                            ) : null}
                            {t.status === "processing" ? (
                              <button className="dash-action-btn dash-action-complete" title="Mark as completed — recipient received funds"
                                onClick={() => handleUpdateStatus(t.id, "completed")}>
                                <CheckCircle2 size={14} /> Complete
                              </button>
                            ) : null}
                            {t.status === "completed" ? (
                              <button className="dash-action-btn dash-action-danger" title="Delete transaction record"
                                onClick={() => handleDelete(t.id)}>
                                <Trash2 size={14} /> Delete
                              </button>
                            ) : null}
                            {t.status === "cancelled" ? (
                              <button className="dash-action-btn dash-action-danger" title="Delete transaction record"
                                onClick={() => handleDelete(t.id)}>
                                <Trash2 size={14} /> Delete
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

            {totalPages > 1 ? (
              <div className="dash-pagination">
                <button className="button button-secondary" disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <div className="dash-pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p}
                      className={`dash-page-btn ${p === safePage ? "active" : ""}`}
                      onClick={() => setPage(p)}>{p}</button>
                  ))}
                </div>
                <button className="button button-secondary" disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            ) : null}
          </>
        )}

        {tab === "users" && (
          <>
            <div className="dash-controls">
              <span className="dash-count">{allUsers.length} user{allUsers.length !== 1 ? "s" : ""}</span>
            </div>
            {fundError ? <div className="form-error">{fundError}</div> : null}
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Balance</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.phone}</td>
                      <td>{u.email}</td>
                      <td className="dash-amount">{u.balance !== undefined ? formatCurrency(u.balance) : "—"}</td>
                      <td>{formatDate(u.created_at)}</td>
                      <td>
                        {fundUserId === u.id ? (
                          <form className="admin-fund-form" onSubmit={handleFundUser}>
                            <input type="number" min="100" required placeholder="Amount"
                              value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                              className="admin-fund-input" />
                            <button className="button button-primary" type="submit" disabled={funding}
                              style={{ minHeight: 32, fontSize: "0.8rem", padding: "0 10px" }}>
                              {funding ? <Loader2 className="spin" size={14} /> : "Add"}
                            </button>
                            <button className="button button-secondary" type="button"
                              onClick={() => { setFundUserId(""); setFundAmount(""); setFundError(""); }}
                              style={{ minHeight: 32, fontSize: "0.8rem", padding: "0 10px" }}>
                              <X size={14} />
                            </button>
                          </form>
                        ) : (
                          <button className="dash-action-btn" title="Fund wallet"
                            onClick={() => { setFundUserId(u.id); setFundError(""); }}>
                            <Banknote size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "testimonials" && (
          <>
            <div className="dash-controls">
              <span className="dash-count">{allTestimonials.length} testimonial{allTestimonials.length !== 1 ? "s" : ""}</span>
            </div>
            {actionError ? <div className="form-error" style={{ margin: "8px 0" }}>{actionError}</div> : null}
            {allTestimonials.length === 0 ? (
              <div className="dash-empty">
                <MessageCircle size={40} />
                <strong>No testimonials yet</strong>
                <p>Testimonials submitted by users will appear here for moderation.</p>
              </div>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Text</th>
                      <th>Stars</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTestimonials.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.name}</strong></td>
                        <td>{t.location || "—"}</td>
                        <td className="dash-desc" style={{ maxWidth: 300 }}>{t.text}</td>
                        <td>
                          <span style={{ display: "inline-flex", gap: 2, color: "var(--accent)" }}>
                            {Array.from({ length: t.stars }, (_, i) => (
                              <Star key={i} size={13} fill="var(--accent)" />
                            ))}
                          </span>
                        </td>
                        <td>
                          <span className={`dash-badge ${t.is_approved ? "badge-completed" : "badge-pending"}`}>
                            {t.is_approved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td>{formatDate(t.created_at)}</td>
                        <td>
                          <div className="dash-row-actions">
                            {!t.is_approved ? (
                              <button className="dash-action-btn dash-action-complete" title="Approve"
                                onClick={async () => {
                                  if (!token) return;
                                  setActionError("");
                                  try {
                                    await apiAdminApproveTestimonial(token, t.id, true);
                                    await fetchData();
                                  } catch (err) {
                                    setActionError(err instanceof Error ? err.message : "Failed to approve");
                                  }
                                }}>
                                <CheckCircle2 size={14} /> Approve
                              </button>
                            ) : (
                              <button className="dash-action-btn" title="Unapprove"
                                onClick={async () => {
                                  if (!token) return;
                                  setActionError("");
                                  try {
                                    await apiAdminApproveTestimonial(token, t.id, false);
                                    await fetchData();
                                  } catch (err) {
                                    setActionError(err instanceof Error ? err.message : "Failed to unapprove");
                                  }
                                }}>
                                <XCircle size={14} /> Unapprove
                              </button>
                            )}
                            <button className="dash-action-btn dash-action-danger" title="Delete"
                              onClick={async () => {
                                if (!token) return;
                                if (!confirm("Delete this testimonial?")) return;
                                setActionError("");
                                try {
                                  await apiAdminDeleteTestimonial(token, t.id);
                                  await fetchData();
                                } catch (err) {
                                  setActionError(err instanceof Error ? err.message : "Failed to delete");
                                }
                              }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "settings" && (
          <div className="admin-settings">
            <div className="dash-controls">
              <span className="dash-count">Platform settings</span>
              <div style={{ display: "flex", gap: 8 }}>
                {settingsMsg ? <span className="admin-settings-msg">{settingsMsg}</span> : null}
                <button className="button button-primary" type="button" onClick={handleSaveSettings} disabled={savingSettings}>
                  <Save size={16} /> Save
                </button>
                <button className="button button-secondary" type="button" onClick={handleResetSettings}>
                  Reset defaults
                </button>
              </div>
            </div>

            <div className="admin-settings-section">
              <strong>Fee rates</strong>
              <div className="admin-settings-grid">
                <label>
                  <span>Standard rate (%)</span>
                  <input type="number" step="0.1" min="0" max="100"
                    value={settings.feeRates.standard * 100}
                    onChange={(e) => setSettings({ ...settings, feeRates: { ...settings.feeRates, standard: Number(e.target.value) / 100 } })} />
                </label>
                <label>
                  <span>VIP rate (%)</span>
                  <input type="number" step="0.1" min="0" max="100"
                    value={settings.feeRates.vip * 100}
                    onChange={(e) => setSettings({ ...settings, feeRates: { ...settings.feeRates, vip: Number(e.target.value) / 100 } })} />
                </label>
                <label>
                  <span>VIP threshold (MK)</span>
                  <input type="number" step="1000" min="0"
                    value={settings.feeRates.vipThreshold}
                    onChange={(e) => setSettings({ ...settings, feeRates: { ...settings.feeRates, vipThreshold: Number(e.target.value) } })} />
                </label>
                <label>
                  <span>Minimum fee (MK)</span>
                  <input type="number" step="100" min="0"
                    value={settings.feeRates.minFee}
                    onChange={(e) => setSettings({ ...settings, feeRates: { ...settings.feeRates, minFee: Number(e.target.value) } })} />
                </label>
                <label>
                  <span>Bill fee rate (%)</span>
                  <input type="number" step="0.1" min="0" max="100"
                    value={settings.feeRates.billFee * 100}
                    onChange={(e) => setSettings({ ...settings, feeRates: { ...settings.feeRates, billFee: Number(e.target.value) / 100 } })} />
                </label>
              </div>
            </div>

            <div className="admin-settings-section">
              <div className="admin-settings-header">
                <strong>Supported countries</strong>
                <button className="button button-secondary" type="button" onClick={addCountry}
                  style={{ minHeight: 34, padding: "0 12px", fontSize: "0.85rem" }}>
                  <Plus size={15} /> Add country
                </button>
              </div>
              {settings.countries.map((c, i) => (
                <div key={i} className="admin-settings-country">
                  <div className="admin-settings-grid">
                    <label><span>Name</span>
                      <input value={c.name} onChange={(e) => updateCountry(i, "name", e.target.value)} /></label>
                    <label><span>Code (ISO2)</span>
                      <input value={c.code} onChange={(e) => updateCountry(i, "code", e.target.value.toUpperCase())} maxLength={2} /></label>
                    <label><span>Slug</span>
                      <input value={c.slug} onChange={(e) => updateCountry(i, "slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} /></label>
                  </div>
                  <label><span>Wallets (comma separated)</span>
                    <input value={c.wallets.join(", ")}
                      onChange={(e) => updateCountry(i, "wallets", e.target.value.split(",").map((w) => w.trim()).filter(Boolean))} /></label>
                  <label><span>Note</span>
                    <textarea value={c.note} onChange={(e) => updateCountry(i, "note", e.target.value)} rows={2} /></label>
                  <button className="button button-secondary dash-action-danger" type="button"
                    onClick={() => removeCountry(i)}
                    style={{ minHeight: 34, padding: "0 12px", fontSize: "0.85rem", width: "fit-content" }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-settings-section">
              <strong>Payment methods</strong>
              <label>
                <span>Methods (one per line)</span>
                <textarea value={settings.paymentMethods.join("\n")}
                  onChange={(e) => setSettings({ ...settings, paymentMethods: e.target.value.split("\n").map((m) => m.trim()).filter(Boolean) })}
                  rows={4} />
              </label>
            </div>

            <div className="admin-settings-section">
              <strong>WhatsApp number</strong>
              <label>
                <span>Display number</span>
                <input value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
              </label>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
