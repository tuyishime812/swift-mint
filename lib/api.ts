const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  idempotencyKey?: string;
};

async function request<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || `Request failed (${res.status})`);
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
