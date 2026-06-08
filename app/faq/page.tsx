import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about SwiftMint Exchange outbound mobile money transfers from Malawi.",
};

const faqs = [
  {
    q: "How does SwiftMint work?",
    a: "You submit a transfer request with the destination country, recipient name, wallet type, recipient number, and amount in MWK. SwiftMint reviews the details, confirms the expected payout amount, and processes the request after your approval.",
  },
  {
    q: "What countries can I send money to?",
    a: "SwiftMint supports outbound mobile wallet payouts to 37+ countries across Africa, Asia, and Europe. See the full list on our <a href=\"/countries\">supported countries page</a>.",
  },
  {
    q: "Which mobile wallets are supported?",
    a: "Supported wallets vary by country and include M-Pesa, Airtel Money, MTN MoMo, Tigo Pesa, Vodafone Cash, and others. The exact options are listed on each country page.",
  },
  {
    q: "How are fees calculated?",
    a: "Standard requests are charged at 6%. Requests of MK 300,000 and above may qualify for a reduced VIP fee of 3-4%. A minimum fee of MK 5,000 applies to keep small requests viable.",
  },
  {
    q: "When is the payout amount confirmed?",
    a: "SwiftMint confirms the expected payout amount before you authorise processing. This ensures you know the exact value your recipient will receive.",
  },
  {
    q: "How do I pay for the transfer?",
    a: "SwiftMint accepts Airtel Money, TNM Mpamba, and National Bank transfers in Malawi. Payment is collected after the request details are confirmed.",
  },
  {
    q: "How long does a transfer take?",
    a: "Processing times depend on the destination country and wallet. SwiftMint provides status updates through WhatsApp throughout the process.",
  },
  {
    q: "How do I contact SwiftMint?",
    a: `You can reach SwiftMint on WhatsApp at ${formattedWhatsappNumber}. This is the primary channel for requests, confirmations, and support.`,
  },
];

export default function FAQPage() {
  return (
    <main>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Common questions about SwiftMint Exchange, fees, supported countries, and how the transfer process works."
      />

      <section className="section" aria-labelledby="faq-list">
        <div className="faq-grid">
          {faqs.map((faq) => (
            <details className="faq-item" key={faq.q}>
              <summary className="faq-question">
                {faq.q}
              </summary>
              <div className="faq-answer">
                <p dangerouslySetInnerHTML={{ __html: faq.a }} />
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="info-band" aria-labelledby="faq-contact">
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2 id="faq-contact">Still have questions?</h2>
          <p>
            Reach out on WhatsApp at {formattedWhatsappNumber} and SwiftMint will
            respond with the information you need.
          </p>
        </div>
      </section>
    </main>
  );
}
