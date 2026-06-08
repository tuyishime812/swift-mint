export const whatsappNumber = "265882156440";
export const formattedWhatsappNumber = "+265 882 156 440";

export type Country = {
  slug: string;
  code: string;
  name: string;
  currency: string;
  wallets: string[];
  note: string;
};

export type TransferRequestInput = {
  country: string;
  recipientName: string;
  walletType: string;
  recipientNumber: string;
  amount: string;
};

export const countries: Country[] = [
  { slug: "mozambique", code: "MZ", name: "Mozambique", currency: "MZN", wallets: ["M-Pesa", "eMola"], note: "Growing mobile money corridor with M-Pesa and eMola coverage across major cities." },
  { slug: "south-africa", code: "ZA", name: "South Africa", currency: "ZAR", wallets: ["SnapScan", "Zapper", "M-Pesa"], note: "Well-established financial infrastructure with multiple digital payment options." },
  { slug: "kenya", code: "KE", name: "Kenya", currency: "KES", wallets: ["M-Pesa", "Airtel Money", "T-Kash"], note: "Leading mobile money market in Africa with extensive M-Pesa agent network." },
  { slug: "angola", code: "AO", name: "Angola", currency: "AOA", wallets: ["Unitel Money", "Afrimoney"], note: "Emerging mobile money market with Unitel Money as the leading wallet." },
  { slug: "drc", code: "CD", name: "DRC", currency: "CDF", wallets: ["M-Pesa", "Airtel Money", "Orange Money"], note: "Multiple wallet providers serve the vast Congolese market." },
  { slug: "uganda", code: "UG", name: "Uganda", currency: "UGX", wallets: ["MTN MoMo", "Airtel Money"], note: "Direct mobile wallet details help reduce delays caused by incomplete transfer requests." },
  { slug: "tanzania", code: "TZ", name: "Tanzania", currency: "TZS", wallets: ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"], note: "Multiple wallet options allow SwiftMint to confirm the best available payout path." },
  { slug: "cameroon", code: "CM", name: "Cameroon", currency: "XAF", wallets: ["MTN MoMo", "Orange Money", "Yup"], note: "MTN and Orange dominate the mobile money landscape in Cameroon." },
  { slug: "chad", code: "TD", name: "Chad", currency: "XAF", wallets: ["Airtel Money", "Tigo"], note: "Airtel Money is widely used across urban and rural areas." },
  { slug: "equatorial-guinea", code: "GQ", name: "Equatorial Guinea", currency: "XAF", wallets: ["M-Pesa"], note: "M-Pesa is the primary mobile money provider in the country." },
  { slug: "ivory-coast", code: "CI", name: "Ivory Coast", currency: "XOF", wallets: ["MTN MoMo", "Orange Money", "Wave"], note: "Highly competitive mobile money market with Wave gaining rapid adoption." },
  { slug: "senegal", code: "SN", name: "Senegal", currency: "XOF", wallets: ["Orange Money", "Wave", "Free Money"], note: "Orange Money leads with Wave as a fast-growing alternative." },
  { slug: "mali", code: "ML", name: "Mali", currency: "XOF", wallets: ["Orange Money", "Moov Money"], note: "Orange Money is the most widely used mobile wallet in Mali." },
  { slug: "togo", code: "TG", name: "Togo", currency: "XOF", wallets: ["Togocom", "Moov Money", "Flooz"], note: "Togocom and Flooz offer widespread mobile money access." },
  { slug: "niger", code: "NE", name: "Niger", currency: "XOF", wallets: ["Orange Money", "Airtel Money"], note: "Orange Money and Airtel Money serve the Nigerien market." },
  { slug: "benin", code: "BJ", name: "Benin", currency: "XOF", wallets: ["MTN MoMo", "Moov Money"], note: "MTN MoMo is widely used across Benin." },
  { slug: "guinea-bissau", code: "GW", name: "Guinea-Bissau", currency: "XOF", wallets: ["Orange Money", "MTN MoMo"], note: "Mobile money adoption growing steadily with Orange Money." },
  { slug: "botswana", code: "BW", name: "Botswana", currency: "BWP", wallets: ["Orange Money", "Mascom Money"], note: "Mascom Money and Orange Money serve the Botswana market." },
  { slug: "burundi", code: "BI", name: "Burundi", currency: "BIF", wallets: ["M-Pesa", "Airtel Money", "Lumicash"], note: "Lumicash and M-Pesa are the dominant mobile wallets." },
  { slug: "madagascar", code: "MG", name: "Madagascar", currency: "MGA", wallets: ["M-vola", "Airtel Money", "Orange Money"], note: "M-vola leads as the top mobile money service in Madagascar." },
  { slug: "namibia", code: "NA", name: "Namibia", currency: "NAD", wallets: ["M-Pesa", "eWallet"], note: "M-Pesa Namibia and bank-based eWallets are widely used." },
  { slug: "zambia", code: "ZM", name: "Zambia", currency: "ZMW", wallets: ["MTN MoMo", "Airtel Money"], note: "A practical corridor for business and personal outbound payment needs." },
  { slug: "ghana", code: "GH", name: "Ghana", currency: "GHS", wallets: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"], note: "Wallet selection is confirmed at processing time based on current availability." },
  { slug: "india", code: "IN", name: "India", currency: "INR", wallets: ["Paytm", "Google Pay", "PhonePe", "UPI"], note: "India has a massive UPI-based digital payments ecosystem with multiple wallets." },
  { slug: "pakistan", code: "PK", name: "Pakistan", currency: "PKR", wallets: ["JazzCash", "Easypaisa", "UBL"], note: "JazzCash and Easypaisa are the leading mobile wallets in Pakistan." },
  { slug: "vietnam", code: "VN", name: "Vietnam", currency: "VND", wallets: ["MoMo", "ZaloPay", "ViettelPay"], note: "MoMo is Vietnam's most popular e-wallet with millions of users." },
  { slug: "philippines", code: "PH", name: "Philippines", currency: "PHP", wallets: ["GCash", "PayMaya", "Smart Money"], note: "GCash dominates the Philippine mobile money market." },
  { slug: "indonesia", code: "ID", name: "Indonesia", currency: "IDR", wallets: ["GoPay", "OVO", "DANA", "LinkAja"], note: "Multiple digital wallets compete in Indonesia's fast-growing fintech market." },
  { slug: "austria", code: "AT", name: "Austria", currency: "EUR", wallets: ["SEPA", "Apple Pay", "Google Pay"], note: "Bank transfers via SEPA and digital wallets are standard." },
  { slug: "new-zealand", code: "NZ", name: "New Zealand", currency: "NZD", wallets: ["POLi", "Apple Pay", "Google Pay"], note: "POLi internet banking and digital wallets are common." },
  { slug: "taiwan", code: "TW", name: "Taiwan", currency: "TWD", wallets: ["JKOPay", "Line Pay", "Bank Transfer"], note: "Line Pay and JKOPay lead Taiwan's mobile payment market." },
  { slug: "kazakhstan", code: "KZ", name: "Kazakhstan", currency: "KZT", wallets: ["Kaspi Bank", "Qiwi"], note: "Kaspi Bank is the dominant digital payments platform." },
  { slug: "cambodia", code: "KH", name: "Cambodia", currency: "KHR", wallets: ["Wing", "ABA Pay", "SmartLuy"], note: "Wing and ABA Pay lead Cambodia's mobile money sector." },
  { slug: "afghanistan", code: "AF", name: "Afghanistan", currency: "AFN", wallets: ["M-Paisa", "Roshan Money"], note: "M-Paisa by Roshan is the pioneer mobile money service." },
  { slug: "mongolia", code: "MN", name: "Mongolia", currency: "MNT", wallets: ["Khan Bank", "Golomt"], note: "Bank-based mobile apps are the primary digital payment method." },
  { slug: "myanmar", code: "MM", name: "Myanmar", currency: "MMK", wallets: ["Wave Money", "KBZ Pay", "M-Pitesan"], note: "Wave Money is the most widely used mobile financial service." },
  { slug: "sri-lanka", code: "LK", name: "Sri Lanka", currency: "LKR", wallets: ["mCash", "EzCash", "FriMi"], note: "mCash and EzCash are the leading mobile wallet providers." },
];

export const pricing = [
  {
    label: "Standard fee",
    value: "6%",
    description: "Applied to standard outbound transfer requests.",
  },
  {
    label: "VIP fee",
    value: "3-4%",
    description: "Available for requests from MK 300,000 and above.",
  },
  {
    label: "Minimum fee",
    value: "MK 5,000",
    description: "Keeps small requests commercially viable and clearly priced.",
  },
];

export const acceptedPaymentMethods = [
  "Airtel Money",
  "TNM Mpamba",
  "National Bank Transfer",
];

export const walletOptions = Array.from(
  new Set(countries.flatMap((country) => country.wallets)),
).sort();

export function findCountryByName(name: string) {
  return countries.find(
    (country) => country.name.toLowerCase() === name.trim().toLowerCase(),
  );
}

export function buildWhatsAppMessage(input: TransferRequestInput) {
  return [
    "Hello SwiftMint Exchange, I would like to request a transfer.",
    "",
    `Country: ${input.country}`,
    `Recipient name: ${input.recipientName}`,
    `Wallet type: ${input.walletType}`,
    `Recipient number: ${input.recipientNumber}`,
    `Amount in MWK: ${input.amount}`,
  ].join("\n");
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function validateTransferRequest(input: TransferRequestInput) {
  const errors: Partial<Record<keyof TransferRequestInput, string>> = {};
  const country = findCountryByName(input.country);
  const amount = Number(input.amount);

  if (!country) {
    errors.country = "Choose a supported destination country.";
  }

  if (!input.recipientName.trim()) {
    errors.recipientName = "Enter the recipient full name.";
  }

  if (!walletOptions.includes(input.walletType)) {
    errors.walletType = "Choose a supported mobile wallet.";
  }

  if (country && !country.wallets.includes(input.walletType)) {
    errors.walletType = `Choose a wallet supported in ${country.name}.`;
  }

  if (!input.recipientNumber.trim()) {
    errors.recipientNumber = "Enter the recipient mobile number.";
  }

  if (!input.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter a valid MWK amount.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
