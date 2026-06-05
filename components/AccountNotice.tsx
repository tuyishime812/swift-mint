"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const ACK_KEY = "sm-account-ack";

export function AccountNotice() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      setVisible(false);
      return;
    }
    const acked = localStorage.getItem(ACK_KEY) === "true";
    setVisible(!acked);
  }, [user]);

  function handleAccept() {
    localStorage.setItem(ACK_KEY, "true");
    setVisible(false);
  }

  function handleDismiss() {
    setVisible(false);
  }

  if (!visible || !user) return null;

  return (
    <div className="account-notice-overlay">
      <div className="account-notice">
        <button className="account-notice-close" type="button" onClick={handleDismiss} aria-label="Dismiss">
          <X size={20} />
        </button>
        <strong>Welcome, {user.name}!</strong>
        <p>
          Your SwiftMint account is ready. Send money to our payment number below,
          then place an order on WhatsApp or the website with your payment details
          so we can process the payout to your recipient.
        </p>
        <div className="account-notice-payment" style={{ background: "var(--surface)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.85rem", margin: "0.5rem 0" }}>
          <strong>Send to:</strong>
          <div>Airtel Money &mdash; <strong>+265 882 156 440</strong></div>
          <div>TNM Mpamba &mdash; <strong>+265 882 156 440</strong></div>
          <div>National Bank Transfer &mdash; <strong>+265 882 156 440</strong></div>
        </div>
        <button className="button button-primary" type="button" onClick={handleAccept}>
          Got it
        </button>
      </div>
    </div>
  );
}
