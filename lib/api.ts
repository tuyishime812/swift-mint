const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || "";
const API_BASE = configuredApiBase || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

export const AUTH_EXPIRED_EVENT = "swiftmint:auth-expired";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  idempotencyKey?: string;
};

function getApiBase(): string {
  if (API_BASE) return API_BASE;
  throw new Error("SwiftMint API URL is not configured.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parseResponseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  const text = await res.text();
  return text || null;
}

function validationMessage(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;
  return detail
    .map((entry) => {
      if (isRecord(entry) && typeof entry.msg === "string") return entry.msg;
      return JSON.stringify(entry);
    })
    .join("; ");
}

function responseErrorMessage(data: unknown, status: number): string {
  if (isRecord(data)) {
    const detail = data.detail;
    const validation = validationMessage(detail);
    if (validation) return validation;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (typeof data.message === "string" && data.message.trim()) return data.message;
  }

  if (typeof data === "string" && data.trim()) return data;
  return `Request failed (${status})`;
}

async function request<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      method: opts.method || "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("API URL is not configured")) {
      throw err;
    }
    throw new Error("Unable to reach SwiftMint API. Please try again.");
  }

  const data = await parseResponseBody(res);

  if (!res.ok) {
    const msg = responseErrorMessage(data, res.status);
    if (res.status === 401 && opts.token && typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new Error(msg);
  }

  return data as T;
}

export type UserData = {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email: string;
  is_admin?: boolean;
  created_at: string;
};

export type TransactionData = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  amount: number;
  fee: number;
  payout: number;
  currency: string;
  description: string;
  reference: string;
  country?: string;
  recipient_name?: string;
  wallet_type?: string;
  recipient_number?: string;
  created_at: string;
  updated_at: string;
};

// Auth
export function apiSignup(input: { name: string; email: string; phone: string; username: string; password: string }) {
  return request<{ token: string; user: UserData }>("/api/auth/signup", {
    method: "POST",
    body: input,
  });
}

export function apiLogin(input: { email_or_username: string; password: string }) {
  return request<{ token: string; user: UserData }>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

export function apiExchangeSupabaseToken(accessToken: string) {
  return request<{ token: string; user: UserData; balance: number }>("/api/auth/supabase", {
    method: "POST",
    body: { access_token: accessToken },
  });
}

export function apiGetMe(token: string) {
  return request<{ user: UserData; balance: number }>("/api/auth/me", { token });
}

// Wallet
export function apiGetBalance(token: string) {
  return request<{ balance: number; wallet_id: string }>("/api/wallet/balance", { token });
}

// Transactions
export function apiGetTransactions(token: string, input: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams({
    limit: String(input.limit ?? 50),
    offset: String(input.offset ?? 0),
  });
  return request<{ transactions: TransactionData[]; limit: number; offset: number }>(`/api/transactions/?${params}`, { token });
}

export function apiSendMoney(token: string, input: {
  country: string;
  recipient_name: string;
  wallet_type: string;
  recipient_number: string;
  amount: number;
}, idempotencyKey?: string) {
  return request<{ success: boolean; reference: string; amount: number; fee: number; total: number; new_balance: number; status: string }>("/api/transactions/send", {
    method: "POST",
    body: input,
    token,
    idempotencyKey,
  });
}

export function apiPayBill(token: string, input: {
  biller: string;
  account_number: string;
  amount: number;
}, idempotencyKey?: string) {
  return request<{ success: boolean; reference: string; amount: number; fee: number; total: number; new_balance: number; status: string }>("/api/transactions/pay-bill", {
    method: "POST",
    body: input,
    token,
    idempotencyKey,
  });
}

export function apiUpdateTransactionStatus(token: string, txnId: string, status: string) {
  return request<{ success: boolean; status: string }>(`/api/transactions/${txnId}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}

export function apiCancelTransaction(token: string, txnId: string) {
  return request<{ success: boolean; status: string }>(`/api/transactions/${txnId}/cancel`, {
    method: "PATCH",
    token,
  });
}

export function apiDeleteTransaction(token: string, txnId: string) {
  return request<{ success: boolean }>(`/api/transactions/${txnId}`, {
    method: "DELETE",
    token,
  });
}

// Admin
export function apiAdminAllTransactions(token: string, input: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams({
    limit: String(input.limit ?? 100),
    offset: String(input.offset ?? 0),
  });
  return request<{ transactions: TransactionData[]; limit: number; offset: number }>(`/api/admin/transactions?${params}`, { token });
}

export function apiAdminAllUsers(token: string, input: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams({
    limit: String(input.limit ?? 100),
    offset: String(input.offset ?? 0),
  });
  return request<{ users: UserData[]; limit: number; offset: number }>(`/api/admin/users?${params}`, { token });
}

export function apiAdminUpdateTransactionStatus(token: string, txnId: string, status: string) {
  return request<{ success: boolean; status: string }>(`/api/admin/transactions/${txnId}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}

export function apiAdminDeleteTransaction(token: string, txnId: string) {
  return request<{ success: boolean }>(`/api/admin/transactions/${txnId}`, {
    method: "DELETE",
    token,
  });
}

export function apiAdminUsersWithBalance(token: string, input: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams({
    limit: String(input.limit ?? 100),
    offset: String(input.offset ?? 0),
  });
  return request<{ users: (UserData & { balance: number })[]; limit: number; offset: number }>(`/api/admin/users-with-balance?${params}`, { token });
}

export function apiAdminFundUser(token: string, userId: string, amount: number, idempotencyKey?: string) {
  return request<{ success: boolean; new_balance: number; reference: string }>("/api/admin/fund-user", {
    method: "POST",
    body: { user_id: userId, amount },
    token,
    idempotencyKey,
  });
}

// Testimonials
// Notifications
export type NotificationData = {
  id: string;
  user_id: string;
  transaction_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function apiGetNotifications(token: string, unreadOnly = false) {
  const params = new URLSearchParams({ limit: "50", offset: "0" });
  if (unreadOnly) params.set("unread_only", "true");
  return request<{ notifications: NotificationData[] }>(`/api/notifications/?${params}`, { token });
}

export function apiUnreadNotificationCount(token: string) {
  return request<{ count: number }>("/api/notifications/unread-count", { token });
}

export function apiMarkNotificationRead(token: string, notifId: string) {
  return request<{ success: boolean }>(`/api/notifications/${notifId}/read`, {
    method: "PATCH",
    token,
  });
}

export function apiMarkAllNotificationsRead(token: string) {
  return request<{ success: boolean }>("/api/notifications/mark-all-read", {
    method: "PATCH",
    token,
  });
}

export type TestimonialData = {
  id: string;
  user_id?: string;
  name: string;
  location: string;
  text: string;
  stars: number;
  is_approved: boolean;
  created_at: string;
};

export function apiGetTestimonials() {
  return request<{ testimonials: TestimonialData[] }>("/api/testimonials");
}

export function apiCreateTestimonial(token: string, input: { text: string; name?: string; location?: string; stars?: number }) {
  return request<{ testimonial: TestimonialData }>("/api/testimonials", {
    method: "POST",
    body: input,
    token,
  });
}

export function apiAdminAllTestimonials(token: string, approved?: boolean) {
  const params = approved !== undefined ? `?approved=${approved}` : "";
  return request<{ testimonials: TestimonialData[] }>(`/api/admin/testimonials${params}`, { token });
}

export function apiAdminApproveTestimonial(token: string, id: string, isApproved: boolean) {
  return request<{ testimonial: TestimonialData }>(`/api/admin/testimonials/${id}/approve`, {
    method: "PATCH",
    body: { is_approved: isApproved },
    token,
  });
}

export function apiAdminDeleteTestimonial(token: string, id: string) {
  return request<{ success: boolean }>(`/api/admin/testimonials/${id}`, {
    method: "DELETE",
    token,
  });
}
