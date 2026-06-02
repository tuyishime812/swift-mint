"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";

const STANDARD_FEE_RATE = 0.06;
const VIP_FEE_RATE_LOW = 0.03;
const VIP_FEE_RATE_HIGH = 0.04;
const VIP_THRESHOLD = 300000;
const MINIMUM_FEE = 5000;

function formatNumber(n: number): string {
  return `MK ${n.toLocaleString("en-MW")}`;
}

export function PayoutCalculator() {
  const [amount, setAmount] = useState("");

  const numAmount = Number(amount);
  const isValid = amount.trim() !== "" && !Number.isNaN(numAmount) && numAmount > 0;

  let fee = 0;
  let vipRate = "";
  let isVip = false;

  if (isValid) {
    if (numAmount >= VIP_THRESHOLD) {
      const rawFeeLow = numAmount * VIP_FEE_RATE_LOW;
      const rawFeeHigh = numAmount * VIP_FEE_RATE_HIGH;
      fee = Math.max(rawFeeLow, MINIMUM_FEE);
      vipRate = `${(VIP_FEE_RATE_LOW * 100).toFixed(0)}-${(VIP_FEE_RATE_HIGH * 100).toFixed(0)}%`;
      isVip = true;
    } else {
      const rawFee = numAmount * STANDARD_FEE_RATE;
      fee = Math.max(rawFee, MINIMUM_FEE);
    }
  }

  const estimatedPayout = isValid ? numAmount - fee : 0;

  return (
    <div className="calculator-card">
      <div className="calculator-header">
        <Calculator size={22} aria-hidden="true" />
        <h3>Payout estimate</h3>
      </div>
      <p className="calculator-lede">
        Enter an amount to see the estimated service fee and payout.
      </p>

      <div className="calculator-input-group">
        <label>
          <span>Amount in MWK</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100000"
          />
        </label>
      </div>

      {isValid ? (
        <div className="calculator-results">
          <div className="calc-result-row">
            <span>Service fee</span>
            <strong className={isVip ? "calc-vip" : ""}>
              {formatNumber(Math.round(fee))}
              {isVip ? (
                <small className="calc-badge">VIP ({vipRate})</small>
              ) : null}
            </strong>
          </div>
          <div className="calc-result-row calc-total">
            <span>Estimated payout</span>
            <strong>{formatNumber(Math.round(estimatedPayout))}</strong>
          </div>
          <div className="calc-note">
            <Info size={15} aria-hidden="true" />
            <span>
              Final payout confirmed at processing. Amounts above MK {VIP_THRESHOLD.toLocaleString("en-MW")} may qualify for VIP pricing.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
