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
          Your SwiftMint account is ready. Fund your wallet to start sending
          money to mobile wallets across Africa. Transfers are processed
          manually — you will see &quot;Pending&quot; status until the admin
          confirms and completes the payout.
        </p>
        <button className="button button-primary" type="button" onClick={handleAccept}>
          Got it
        </button>
      </div>
    </div>
  );
}
