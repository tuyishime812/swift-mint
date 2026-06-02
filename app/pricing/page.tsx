import type { Metadata } from "next";
import { PricingCards } from "@/components/PricingCards";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent service fees for outbound mobile wallet transfers from Malawi. Standard and VIP fee options available.",
};

export default function PricingPage() {
  return (
    <main>
      <PageHero
        eyebrow="Pricing"
        title="Transparent fees for outbound requests"
        description="SwiftMint applies a simple fee model and confirms the expected payout amount before processing each transfer request."
        ctaLabel="Prepare transfer request"
        ctaHref="/transfer"
      />

      <section className="pricing-band page-pricing" aria-labelledby="fees-title">
        <div>
          <p className="eyebrow">Service fees</p>
          <h2 id="fees-title">Clear pricing before processing</h2>
          <p>
            Final payout amounts are calculated at the moment of processing,
            based on the most favourable available payout option for the
            destination country.
          </p>
        </div>
        <PricingCards />
      </section>

      <section className="section split-section" aria-labelledby="pricing-notes">
        <div>
          <p className="eyebrow">Important notes</p>
          <h2 id="pricing-notes">The customer always confirms first</h2>
        </div>
        <div className="detail-list">
          <div>
            <strong>Standard requests</strong>
            <p>Standard transfer requests use the published 6% service fee.</p>
          </div>
          <div>
            <strong>VIP requests</strong>
            <p>Requests from MK 300,000 may qualify for a 3-4% VIP fee.</p>
          </div>
          <div>
            <strong>Payout calculation</strong>
            <p>
              SwiftMint confirms the expected payout amount before the customer
              authorizes processing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
