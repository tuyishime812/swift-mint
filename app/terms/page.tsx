import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "SwiftMint Exchange terms and conditions governing the use of our mobile money facilitation service.",
};

export default function TermsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Please read these terms carefully before using SwiftMint Exchange services."
      />

      <section className="section">
        <div className="legal-content">
          <h3>Service Description</h3>
          <p>
            SwiftMint Exchange facilitates outbound mobile wallet payout requests from Malawi to
            selected African countries. We prepare and submit transfer requests on behalf of
            customers through WhatsApp communication.
          </p>

          <h3>Customer Responsibilities</h3>
          <p>
            You agree to provide accurate and complete information for each transfer request.
            You are responsible for ensuring the recipient details, mobile wallet information, and
            amount are correct before authorising processing.
          </p>

          <h3>Fees and Pricing</h3>
          <p>
            Service fees are disclosed before processing. Standard fee is 6% of the transfer
            amount. VIP pricing (3-4%) may apply for requests of MK 300,000 and above. A minimum
            fee of MK 5,000 applies. Final payout is confirmed before you authorise processing.
          </p>

          <h3>Processing</h3>
          <p>
            SwiftMint confirms the expected payout amount before processing each request. Once
            you authorise processing, the payout is handled through available mobile money
            channels in the destination country.
          </p>

          <h3>Limitation of Liability</h3>
          <p>
            SwiftMint acts as a facilitator for transfer requests. We are not liable for delays
            or issues caused by incorrect information provided by the customer, mobile network
            disruptions, or actions of third-party payment providers.
          </p>

          <h3>Contact</h3>
          <p>
            For questions about these terms, contact us on WhatsApp at {formattedWhatsappNumber}.
          </p>
        </div>
      </section>
    </main>
  );
}
