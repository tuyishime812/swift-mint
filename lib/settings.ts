const SETTINGS_KEY = "sm-settings";

export type CountrySetting = {
  slug: string;
  code: string;
  name: string;
  wallets: string[];
  note: string;
};

export type PlatformSettings = {
  countries: CountrySetting[];
  pricing: { label: string; value: string; description: string }[];
  paymentMethods: string[];
  feeRates: { standard: number; vip: number; vipThreshold: number; minFee: number; billFee: number };
  whatsapp: string;
};

const defaultSettings: PlatformSettings = {
  countries: [
    { slug: "mozambique", code: "MZ", name: "Mozambique", wallets: ["M-Pesa", "eMola"], note: "Growing mobile money corridor with M-Pesa and eMola coverage across major cities." },
    { slug: "south-africa", code: "ZA", name: "South Africa", wallets: ["SnapScan", "Zapper", "M-Pesa"], note: "Well-established financial infrastructure with multiple digital payment options." },
    { slug: "kenya", code: "KE", name: "Kenya", wallets: ["M-Pesa", "Airtel Money", "T-Kash"], note: "Leading mobile money market in Africa with extensive M-Pesa agent network." },
    { slug: "angola", code: "AO", name: "Angola", wallets: ["Unitel Money", "Afrimoney"], note: "Emerging mobile money market with Unitel Money as the leading wallet." },
    { slug: "drc", code: "CD", name: "DRC", wallets: ["M-Pesa", "Airtel Money", "Orange Money"], note: "Multiple wallet providers serve the vast Congolese market." },
    { slug: "uganda", code: "UG", name: "Uganda", wallets: ["MTN MoMo", "Airtel Money"], note: "Direct mobile wallet details help reduce delays caused by incomplete transfer requests." },
    { slug: "tanzania", code: "TZ", name: "Tanzania", wallets: ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"], note: "Multiple wallet options allow SwiftMint to confirm the best available payout path." },
    { slug: "cameroon", code: "CM", name: "Cameroon", wallets: ["MTN MoMo", "Orange Money", "Yup"], note: "MTN and Orange dominate the mobile money landscape in Cameroon." },
    { slug: "chad", code: "TD", name: "Chad", wallets: ["Airtel Money", "Tigo"], note: "Airtel Money is widely used across urban and rural areas." },
    { slug: "equatorial-guinea", code: "GQ", name: "Equatorial Guinea", wallets: ["M-Pesa"], note: "M-Pesa is the primary mobile money provider in the country." },
    { slug: "ivory-coast", code: "CI", name: "Ivory Coast", wallets: ["MTN MoMo", "Orange Money", "Wave"], note: "Highly competitive mobile money market with Wave gaining rapid adoption." },
    { slug: "senegal", code: "SN", name: "Senegal", wallets: ["Orange Money", "Wave", "Free Money"], note: "Orange Money leads with Wave as a fast-growing alternative." },
    { slug: "mali", code: "ML", name: "Mali", wallets: ["Orange Money", "Moov Money"], note: "Orange Money is the most widely used mobile wallet in Mali." },
    { slug: "togo", code: "TG", name: "Togo", wallets: ["Togocom", "Moov Money", "Flooz"], note: "Togocom and Flooz offer widespread mobile money access." },
    { slug: "niger", code: "NE", name: "Niger", wallets: ["Orange Money", "Airtel Money"], note: "Orange Money and Airtel Money serve the Nigerien market." },
    { slug: "benin", code: "BJ", name: "Benin", wallets: ["MTN MoMo", "Moov Money"], note: "MTN MoMo is widely used across Benin." },
    { slug: "guinea-bissau", code: "GW", name: "Guinea-Bissau", wallets: ["Orange Money", "MTN MoMo"], note: "Mobile money adoption growing steadily with Orange Money." },
    { slug: "botswana", code: "BW", name: "Botswana", wallets: ["Orange Money", "Mascom Money"], note: "Mascom Money and Orange Money serve the Botswana market." },
    { slug: "burundi", code: "BI", name: "Burundi", wallets: ["M-Pesa", "Airtel Money", "Lumicash"], note: "Lumicash and M-Pesa are the dominant mobile wallets." },
    { slug: "madagascar", code: "MG", name: "Madagascar", wallets: ["M-vola", "Airtel Money", "Orange Money"], note: "M-vola leads as the top mobile money service in Madagascar." },
    { slug: "namibia", code: "NA", name: "Namibia", wallets: ["M-Pesa", "eWallet"], note: "M-Pesa Namibia and bank-based eWallets are widely used." },
    { slug: "zambia", code: "ZM", name: "Zambia", wallets: ["MTN MoMo", "Airtel Money"], note: "A practical corridor for business and personal outbound payment needs." },
    { slug: "ghana", code: "GH", name: "Ghana", wallets: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"], note: "Wallet selection is confirmed at processing time based on current availability." },
    { slug: "india", code: "IN", name: "India", wallets: ["Paytm", "Google Pay", "PhonePe", "UPI"], note: "India has a massive UPI-based digital payments ecosystem with multiple wallets." },
    { slug: "pakistan", code: "PK", name: "Pakistan", wallets: ["JazzCash", "Easypaisa", "UBL"], note: "JazzCash and Easypaisa are the leading mobile wallets in Pakistan." },
    { slug: "vietnam", code: "VN", name: "Vietnam", wallets: ["MoMo", "ZaloPay", "ViettelPay"], note: "MoMo is Vietnam's most popular e-wallet with millions of users." },
    { slug: "philippines", code: "PH", name: "Philippines", wallets: ["GCash", "PayMaya", "Smart Money"], note: "GCash dominates the Philippine mobile money market." },
    { slug: "indonesia", code: "ID", name: "Indonesia", wallets: ["GoPay", "OVO", "DANA", "LinkAja"], note: "Multiple digital wallets compete in Indonesia's fast-growing fintech market." },
    { slug: "austria", code: "AT", name: "Austria", wallets: ["SEPA", "Apple Pay", "Google Pay"], note: "Bank transfers via SEPA and digital wallets are standard." },
    { slug: "new-zealand", code: "NZ", name: "New Zealand", wallets: ["POLi", "Apple Pay", "Google Pay"], note: "POLi internet banking and digital wallets are common." },
    { slug: "taiwan", code: "TW", name: "Taiwan", wallets: ["JKOPay", "Line Pay", "Bank Transfer"], note: "Line Pay and JKOPay lead Taiwan's mobile payment market." },
    { slug: "kazakhstan", code: "KZ", name: "Kazakhstan", wallets: ["Kaspi Bank", "Qiwi"], note: "Kaspi Bank is the dominant digital payments platform." },
    { slug: "cambodia", code: "KH", name: "Cambodia", wallets: ["Wing", "ABA Pay", "SmartLuy"], note: "Wing and ABA Pay lead Cambodia's mobile money sector." },
    { slug: "afghanistan", code: "AF", name: "Afghanistan", wallets: ["M-Paisa", "Roshan Money"], note: "M-Paisa by Roshan is the pioneer mobile money service." },
    { slug: "mongolia", code: "MN", name: "Mongolia", wallets: ["Khan Bank", "Golomt"], note: "Bank-based mobile apps are the primary digital payment method." },
    { slug: "myanmar", code: "MM", name: "Myanmar", wallets: ["Wave Money", "KBZ Pay", "M-Pitesan"], note: "Wave Money is the most widely used mobile financial service." },
    { slug: "sri-lanka", code: "LK", name: "Sri Lanka", wallets: ["mCash", "EzCash", "FriMi"], note: "mCash and EzCash are the leading mobile wallet providers." },
  ],
  pricing: [
    { label: "Standard fee", value: "6%", description: "Applied to standard outbound transfer requests." },
    { label: "VIP fee", value: "3-4%", description: "Available for requests from MK 300,000 and above." },
    { label: "Minimum fee", value: "MK 5,000", description: "Keeps small requests commercially viable and clearly priced." },
  ],
  paymentMethods: ["Airtel Money", "TNM Mpamba", "National Bank Transfer"],
  feeRates: { standard: 0.06, vip: 0.035, vipThreshold: 300000, minFee: 5000, billFee: 0.02 },
  whatsapp: "+265 882 156 440",
};

function ls(): Storage {
  if (typeof window === "undefined") return {} as Storage;
  return localStorage;
}

export function getSettings(): PlatformSettings {
  try {
    const raw = ls().getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlatformSettings;
      return { ...defaultSettings, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...defaultSettings };
}

export function saveSettings(s: PlatformSettings) {
  try {
    ls().setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

export function resetSettings() {
  try {
    ls().removeItem(SETTINGS_KEY);
  } catch { /* ignore */ }
}

export function getWalletOptions(): string[] {
  const s = getSettings();
  return Array.from(new Set(s.countries.flatMap((c) => c.wallets))).sort();
}
