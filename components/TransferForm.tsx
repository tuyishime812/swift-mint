"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import {
  countries,
  type TransferRequestInput,
  walletOptions,
} from "@/lib/swiftmint";

const initialForm: TransferRequestInput = {
  country: "Kenya",
  recipientName: "",
  walletType: "M-Pesa",
  recipientNumber: "",
  amount: "",
};

type ApiResponse = {
  whatsappUrl?: string;
  previewMessage?: string;
  errors?: Partial<Record<keyof TransferRequestInput, string>>;
};

export function TransferForm() {
  const [form, setForm] = useState<TransferRequestInput>(initialForm);
  const [errors, setErrors] = useState<ApiResponse["errors"]>({});
  const [previewMessage, setPreviewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountryWallets = useMemo(() => {
    return (
      countries.find((country) => country.name === form.country)?.wallets ??
      walletOptions
    );
  }, [form.country]);

  function updateField(field: keyof TransferRequestInput, value: string) {
    setForm((current) => {
      if (field === "country") {
        const nextCountry = countries.find((country) => country.name === value);
        const nextWallet = nextCountry?.wallets[0] ?? current.walletType;
        return { ...current, country: value, walletType: nextWallet };
      }

      return { ...current, [field]: value };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setPreviewMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/transfer-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setErrors(data.errors ?? {});
        return;
      }

      setPreviewMessage(data.previewMessage ?? "");

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setErrors({ amount: "Unable to reach the server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="transfer-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>Destination country</span>
          <select
            value={form.country}
            onChange={(event) => updateField("country", event.target.value)}
          >
            {countries.map((country) => (
              <option key={country.slug} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors?.country ? <small>{errors.country}</small> : null}
        </label>

        <label>
          <span>Mobile wallet type</span>
          <select
            value={form.walletType}
            onChange={(event) => updateField("walletType", event.target.value)}
          >
            {selectedCountryWallets.map((wallet) => (
              <option key={wallet} value={wallet}>
                {wallet}
              </option>
            ))}
          </select>
          {errors?.walletType ? <small>{errors.walletType}</small> : null}
        </label>
      </div>

      <label>
        <span>Recipient full name</span>
        <input
          required
          type="text"
          value={form.recipientName}
          onChange={(event) => updateField("recipientName", event.target.value)}
          placeholder="e.g. Grace Mwangi"
        />
        {errors?.recipientName ? <small>{errors.recipientName}</small> : null}
      </label>

      <label>
        <span>Recipient mobile number</span>
        <input
          required
          type="tel"
          value={form.recipientNumber}
          onChange={(event) => updateField("recipientNumber", event.target.value)}
          placeholder="e.g. +254 700 000 000"
        />
        {errors?.recipientNumber ? <small>{errors.recipientNumber}</small> : null}
      </label>

      <label>
        <span>Amount to send in MWK</span>
        <input
          required
          min="1"
          type="number"
          inputMode="numeric"
          value={form.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          placeholder="e.g. 300000"
        />
        {errors?.amount ? <small>{errors.amount}</small> : null}
      </label>

      <button className="button button-primary form-submit" type="submit">
        {isSubmitting ? (
          <Loader2 className="spin" size={19} aria-hidden="true" />
        ) : (
          <MessageCircle size={19} aria-hidden="true" />
        )}
        {isSubmitting ? "Preparing request" : "Open WhatsApp"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      {previewMessage ? (
        <div className="form-success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <div className="form-success-content">
            <strong>Request prepared successfully!</strong>
            <span>WhatsApp should open in a new tab with your message.</span>
          </div>
        </div>
      ) : null}

      {previewMessage ? (
        <div className="form-next-steps" role="note" aria-label="Next steps">
          <strong>What happens next:</strong>
          <ol>
            <li>SwiftMint reviews your request details.</li>
            <li>You receive a confirmation with the expected payout amount.</li>
            <li>After your approval, SwiftMint processes the payout.</li>
          </ol>
          <button
            className="button button-secondary form-new-request"
            type="button"
            onClick={() => {
              setPreviewMessage("");
              setForm(initialForm);
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Start a new request
          </button>
        </div>
      ) : null}
    </form>
  );
}
