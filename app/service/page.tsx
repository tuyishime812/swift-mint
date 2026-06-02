import type { Metadata } from "next";
import { CheckCircle2, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Our Service",
  description:
    "SwiftMint Exchange provides structured outbound mobile wallet payout facilitation from Malawi to selected African countries.",
};

const steps = [
  {
    title: "Customer request",
    text: "The customer submits destination country, recipient name, wallet type, recipient number, and amount in MWK.",
  },
  {
    title: "SwiftMint confirmation",
    text: "SwiftMint reviews the request and confirms the expected payout amount before processing.",
  },
  {
    title: "Mobile wallet payout",
    text: "The recipient-side payout is handled through supported mobile money options for the chosen country.",
  },
  {
    title: "Completion update",
    text: "The customer receives status communication through WhatsApp for a clear and professional experience.",
  },
];

export default function ServicePage() {
  return (
    <main>
      <PageHero
        eyebrow="Our service"
        title="Outbound payment facilitation built for mobile money"
        description="SwiftMint Exchange provides a structured way for customers in Malawi to request outbound mobile wallet payouts to selected African countries."
        ctaLabel="Prepare transfer request"
        ctaHref="/transfer"
      />

      <section className="section split-section" aria-labelledby="service-model">
        <div>
          <p className="eyebrow">Service model</p>
          <h2 id="service-model">Focused, clear, and mobile-first</h2>
          <p>
            SwiftMint keeps the customer-facing service simple: collect the right
            transfer details, confirm value before processing, and use supported
            mobile wallet options in the destination country.
          </p>
        </div>
        <div className="benefit-grid compact">
          <article className="benefit-card">
            <span className="icon-shell">
              <Smartphone size={23} aria-hidden="true" />
            </span>
            <h3>Mobile wallet focus</h3>
            <p>Destination payouts are structured around supported mobile wallets.</p>
          </article>
          <article className="benefit-card">
            <span className="icon-shell">
              <ShieldCheck size={23} aria-hidden="true" />
            </span>
            <h3>Confirmation first</h3>
            <p>Customers see expected payout information before processing.</p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="process-title">
        <div className="section-heading">
          <p className="eyebrow">Process</p>
          <h2 id="process-title">How a request moves through SwiftMint</h2>
        </div>
        <div className="process-grid">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band" aria-labelledby="service-cta">
        <div>
          <p className="eyebrow">Ready</p>
          <h2 id="service-cta">Send the correct details the first time</h2>
          <p>
            The transfer form prepares the exact WhatsApp format SwiftMint needs.
          </p>
        </div>
        <a className="button button-light" href="/transfer">
          <MessageCircle size={19} aria-hidden="true" />
          Start request
          <CheckCircle2 size={18} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}
