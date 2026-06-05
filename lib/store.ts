export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  createdAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: "send" | "receive" | "fund" | "bill" | "fee";
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  amount: number;
  fee: number;
  payout: number;
  currency: "MWK";
  description: string;
  reference: string;
  country?: string;
  recipientName?: string;
  walletType?: string;
  recipientNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type BillPayment = {
  id: string;
  biller: string;
  accountNumber: string;
  amount: number;
  fee: number;
  status: "pending" | "completed" | "failed";
  reference: string;
  createdAt: string;
};

const USERS_KEY = "sm-users";
const SESSION_KEY = "sm-session";
const TXNS_KEY = "sm-transactions";
const BILLS_KEY = "sm-bills";
const BALANCE_KEY = "sm-balance";

function ls(): Storage {
  if (typeof window === "undefined") return {} as Storage;
  return localStorage;
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = ls().getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  try {
    ls().setItem(key, JSON.stringify(value));
  } catch {}
}

function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function getBalance(): number {
  return get(BALANCE_KEY, 0);
}

export function setBalance(amount: number) {
  set(BALANCE_KEY, amount);
}

export function addToBalance(amount: number) {
  const current = getBalance();
  setBalance(current + amount);
}

export function deductFromBalance(amount: number): boolean {
  const current = getBalance();
  if (current < amount) return false;
  setBalance(current - amount);
  return true;
}

export function getUsers(): User[] {
  return get<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]) {
  set(USERS_KEY, users);
}

export function findUserByPhone(phone: string): User | undefined {
  return getUsers().find((u) => u.phone === phone);
}

export function findUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

const ADMIN_PHONE = "0888888888";

export function seedAdminUser() {
  const users = getUsers();
  const existing = users.find((u) => u.isAdmin);
  if (existing) return;
  const admin: User = {
    id: "ADM-001",
    name: "Admin",
    phone: ADMIN_PHONE,
    email: "admin@swiftmint.exchange",
    password: "Admin@123",
    isAdmin: true,
    createdAt: new Date().toISOString(),
  };
  users.push(admin);
  saveUsers(users);
}

export function isAdminUser(user: User | null): boolean {
  return user?.isAdmin === true;
}

export function registerUser(input: {
  name: string;
  phone: string;
  email: string;
  password: string;
}): User {
  const users = getUsers();
  const user: User = {
    id: generateId("USR"),
    name: input.name,
    phone: input.phone,
    email: input.email,
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  addToBalance(20000);
  addTransaction({
    userId: user.id,
    type: "fund",
    amount: 20000,
    fee: 0,
    payout: 20000,
    description: "Welcome bonus",
    reference: generateId("BONUS"),
    status: "completed",
  });
  return user;
}

export function authenticateUser(phone: string, password: string): User | null {
  const user = findUserByPhone(phone);
  if (!user || user.password !== password) return null;
  return user;
}

export function getSession(): User | null {
  const id = ls().getItem(SESSION_KEY);
  if (!id) return null;
  return findUserById(id) ?? null;
}

export function setSession(userId: string) {
  ls().setItem(SESSION_KEY, userId);
}

export function clearSession() {
  ls().removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return !!getSession();
}

export function getTransactions(): Transaction[] {
  return get<Transaction[]>(TXNS_KEY, []);
}

export function saveTransactions(txns: Transaction[]) {
  set(TXNS_KEY, txns);
}

export function addTransaction(input: {
  userId: string;
  type: Transaction["type"];
  amount: number;
  fee: number;
  payout: number;
  description: string;
  reference: string;
  status: Transaction["status"];
  country?: string;
  recipientName?: string;
  walletType?: string;
  recipientNumber?: string;
}): Transaction {
  const txns = getTransactions();
  const txn: Transaction = {
    id: generateId("TXN"),
    userId: input.userId,
    type: input.type,
    status: input.status,
    amount: input.amount,
    fee: input.fee,
    payout: input.payout,
    currency: "MWK",
    description: input.description,
    reference: input.reference,
    country: input.country,
    recipientName: input.recipientName,
    walletType: input.walletType,
    recipientNumber: input.recipientNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  txns.push(txn);
  saveTransactions(txns);
  return txn;
}

export function getUserTransactions(userId: string): Transaction[] {
  return getTransactions().filter((t) => t.userId === userId);
}

export function updateTransactionStatus(id: string, status: Transaction["status"]) {
  const txns = getTransactions();
  const idx = txns.findIndex((t) => t.id === id);
  if (idx === -1) return;
  txns[idx].status = status;
  txns[idx].updatedAt = new Date().toISOString();
  saveTransactions(txns);
}

export function removeTransaction(id: string) {
  const txns = getTransactions();
  saveTransactions(txns.filter((t) => t.id !== id));
}

export function getBillPayments(): BillPayment[] {
  return get<BillPayment[]>(BILLS_KEY, []);
}

export function saveBillPayments(bills: BillPayment[]) {
  set(BILLS_KEY, bills);
}

export function addBillPayment(input: {
  userId: string;
  biller: string;
  accountNumber: string;
  amount: number;
}): BillPayment | null {
  const fee = Math.round(input.amount * 0.02);
  const total = input.amount + fee;
  if (!deductFromBalance(total)) return null;

  const bills = getBillPayments();
  const bill: BillPayment = {
    id: generateId("BILL"),
    biller: input.biller,
    accountNumber: input.accountNumber,
    amount: input.amount,
    fee,
    status: "completed",
    reference: generateId("REF"),
    createdAt: new Date().toISOString(),
  };
  bills.push(bill);
  saveBillPayments(bills);

  addTransaction({
    userId: input.userId,
    type: "bill",
    amount: total,
    fee,
    payout: input.amount,
    description: `Bill payment to ${input.biller}`,
    reference: bill.reference,
    status: "completed",
  });

  return bill;
}

export function sendMoney(input: {
  userId: string;
  country: string;
  recipientName: string;
  walletType: string;
  recipientNumber: string;
  amount: number;
}): { success: boolean; transaction?: Transaction; error?: string } {
  const STANDARD_RATE = 0.06;
  const VIP_RATE = 0.035;
  const MIN_FEE = 5000;
  const VIP_THRESHOLD = 300000;

  const isVip = input.amount >= VIP_THRESHOLD;
  const rawFee = input.amount * (isVip ? VIP_RATE : STANDARD_RATE);
  const fee = Math.max(Math.round(rawFee), MIN_FEE);
  const total = input.amount + fee;

  if (!deductFromBalance(total)) {
    return { success: false, error: "Insufficient wallet balance. Please fund your wallet first." };
  }

  const txn = addTransaction({
    userId: input.userId,
    type: "send",
    amount: input.amount,
    fee,
    payout: input.amount,
    description: `Send to ${input.recipientName} (${input.country}) via ${input.walletType}`,
    reference: generateId("REF"),
    status: "pending",
    country: input.country,
    recipientName: input.recipientName,
    walletType: input.walletType,
    recipientNumber: input.recipientNumber,
  });

  return { success: true, transaction: txn };
}

export function getAllUsers(): User[] {
  return getUsers();
}

export function getAllTransactions(): Transaction[] {
  return getTransactions();
}

export function updateUser(id: string, updates: Partial<User>) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
}

export function deleteUser(id: string) {
  const users = getUsers();
  saveUsers(users.filter((u) => u.id !== id));
}

export const billers = [
  { id: "zuku", name: "Zuku TV", icon: "Monitor" },
  { id: "esco", name: "ESCOM Electricity", icon: "Zap" },
  { id: "airtel", name: "Airtel Airtime", icon: "Smartphone" },
  { id: "tnm", name: "TNM Airtime", icon: "Smartphone" },
  { id: "water", name: "Water Board", icon: "Droplets" },
  { id: "gotv", name: "GOtv", icon: "Tv" },
];
