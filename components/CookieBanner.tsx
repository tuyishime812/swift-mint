"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const COOKIE_KEY = "swiftmint-cookie-consent";

export function CookieBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const val = localStorage.getItem(COOKIE_KEY);
    setDismissed(val === "true");
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_KEY, "true");
    setDismissed(true);
  }

  function handleClose() {
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="cookie-banner" role="alert" aria-label="Cookie consent">
      <p>
        SwiftMint Exchange uses minimal cookies for analytics and core
        functionality. By continuing, you accept our use of cookies.
      </p>
      <div className="cookie-actions">
        <button className="button button-primary" type="button" onClick={handleAccept}>
          Accept
        </button>
        <button className="button cookie-dismiss" type="button" onClick={handleClose} aria-label="Dismiss">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
