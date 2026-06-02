import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { PayoutCalculator } from "@/components/PayoutCalculator";
import { TransferForm } from "@/components/TransferForm";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Transfer Request",
  description:
    "Prepare a complete WhatsApp transfer request for mobile wallet payouts to selected African countries.",
};

export default function TransferPage() {
  return (
    <main>
      <PageHero
        eyebrow="Transfer request"
        title="Prepare a complete WhatsApp transfer request"
        description="Enter the country, recipient name, wallet type, recipient number, and amount in MWK. The app validates the request and opens WhatsApp with a structured message."
      />

      <section className="section request-section" aria-labelledby="transfer-form">
        <div className="request-copy">
          <p className="eyebrow">Required details</p>
          <h2 id="transfer-form">Send the correct format</h2>
          <p>
            SwiftMint will respond with confirmation and expected payout amount
            before processing. The form does not collect payment online.
          </p>
          <div className="request-note">
            <MessageCircle size={20} aria-hidden="true" />
            <span>WhatsApp: {formattedWhatsappNumber}</span>
          </div>
        </div>
        <div className="transfer-columns">
          <TransferForm />
          <PayoutCalculator />
        </div>
      </section>
    </main>
  );
}
