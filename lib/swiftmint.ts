export const whatsappNumber = "265882156440";
export const formattedWhatsappNumber = "+265 882 156 440";

export type Country = {
  slug: string;
  code: string;
  name: string;
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
  {
    slug: "kenya",
    code: "KE",
    name: "Kenya",
    wallets: ["M-Pesa", "Airtel Money", "T-Kash"],
    note: "Popular for supplier payments, family support, and education-related requests.",
  },
  {
    slug: "tanzania",
    code: "TZ",
    name: "Tanzania",
    wallets: ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"],
    note: "Multiple wallet options allow SwiftMint to confirm the best available payout path.",
  },
  {
    slug: "uganda",
    code: "UG",
    name: "Uganda",
    wallets: ["MTN MoMo", "Airtel Money"],
    note: "Direct mobile wallet details help reduce delays caused by incomplete transfer requests.",
  },
  {
    slug: "zambia",
    code: "ZM",
    name: "Zambia",
    wallets: ["MTN MoMo", "Airtel Money"],
    note: "A practical corridor for business and personal outbound payment needs.",
  },
  {
    slug: "ghana",
    code: "GH",
    name: "Ghana",
    wallets: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"],
    note: "Wallet selection is confirmed at processing time based on current availability.",
  },
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
