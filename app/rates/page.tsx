import type { Metadata } from "next";
import { ArrowRight, MessageCircle, TrendingUp } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { PayoutCalculator } from "@/components/PayoutCalculator";
import { PricingCards } from "@/components/PricingCards";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Check Rates",
  description:
    "Check SwiftMint Exchange transfer rates and fees for mobile wallet payouts to Kenya, Tanzania, Uganda, Zambia, and Ghana.",
};

export default function RatesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Check rates"
        title="Transparent rates for mobile wallet payouts"
        description="Use the calculator to estimate fees and payouts for your transfer. Actual amounts are confirmed at processing time."
      />

      <section className="section split-section" aria-labelledby="calc-title">
        <div>
          <p className="eyebrow">Fee calculator</p>
          <h2 id="calc-title">Estimate your transfer cost</h2>
          <p>
            Enter the amount in MWK to see the estimated fee and expected payout.
            Standard and VIP rates apply based on the transfer amount.
          </p>
        </div>
        <PayoutCalculator />
      </section>

      <section className="pricing-band" aria-labelledby="pricing-title">
        <div>
          <p className="eyebrow">Service fees</p>
          <h2 id="pricing-title">Clear pricing before processing</h2>
          <p>
            SwiftMint confirms the expected payout amount before you authorise
            processing. No hidden fees or surprises.
          </p>
        </div>
        <PricingCards />
      </section>

      <section className="section split-section" aria-labelledby="rate-notes">
        <div>
          <p className="eyebrow">Important notes</p>
          <h2 id="rate-notes">How rates work</h2>
        </div>
        <div className="detail-list">
          <div>
            <strong>Standard rate: 6%</strong>
            <p>
              Applied to all standard outbound transfer requests under MK 300,000.
            </p>
          </div>
          <div>
            <strong>VIP rate: 3-4%</strong>
            <p>
              Requests of MK 300,000 and above may qualify for a reduced VIP fee.
            </p>
          </div>
          <div>
            <strong>Minimum fee: MK 5,000</strong>
            <p>
              Ensures small requests remain commercially viable and clearly priced.
            </p>
          </div>
          <div>
            <strong>Payout confirmation</strong>
            <p>
              SwiftMint confirms the expected payout amount before you authorise
              processing, so you know the exact value your recipient will receive.
            </p>
          </div>
        </div>
      </section>

      <section className="info-band" aria-labelledby="rates-contact">
        <TrendingUp size={26} aria-hidden="true" />
        <div>
          <h2 id="rates-contact">Ready to send money?</h2>
          <p>
            Prepare your transfer request and SwiftMint will confirm your rate and
            expected payout before processing.
          </p>
          <a className="button button-light" href="/transfer">
            Start a transfer
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
