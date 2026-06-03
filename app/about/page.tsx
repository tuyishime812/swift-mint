import type { Metadata } from "next";
import { Globe2, Heart, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "SwiftMint Exchange provides premium outbound mobile money facilitation from Malawi to selected African countries.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Security",
    text: "Every transfer request is handled with professional care. We confirm expected payout amounts before processing to ensure transparency.",
  },
  {
    icon: Users,
    title: "Customer First",
    text: "Our WhatsApp-based service puts customers in control. We respond quickly and keep you informed at every step.",
  },
  {
    icon: Globe2,
    title: "Regional Focus",
    text: "We specialise in African corridors, connecting Malawi to Kenya, Tanzania, Uganda, Zambia, and Ghana through mobile wallet payouts.",
  },
  {
    icon: Heart,
    title: "Community Impact",
    text: "We help families and businesses move money across borders efficiently, supporting the diaspora community in Malawi.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About us"
        title="Premium outbound mobile money facilitation"
        description="SwiftMint Exchange is a Malawi-based service that helps customers send mobile wallet payouts to selected African countries with clear pricing and professional handling."
        ctaLabel="Start a transfer"
        ctaHref="/transfer"
      />

      <section className="section split-section" aria-labelledby="story-title">
        <div>
          <p className="eyebrow">Our story</p>
          <h2 id="story-title">Built for the diaspora</h2>
        </div>
        <div className="detail-list">
          <div>
            <strong>Starting in Malawi</strong>
            <p>
              SwiftMint Exchange was created to address a specific need: helping
              customers in Malawi send mobile wallet payouts to selected African
              countries in a structured, transparent way.
            </p>
          </div>
          <div>
            <strong>Mobile-first approach</strong>
            <p>
              We built the service around WhatsApp, the most widely used messaging
              platform in Malawi, so customers can initiate requests and receive
              updates without downloading another app.
            </p>
          </div>
          <div>
            <strong>Growing the network</strong>
            <p>
              Starting with five corridors, we continue to evaluate new
              destinations and wallet options to better serve our customers.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="section-heading">
          <p className="eyebrow">Our values</p>
          <h2 id="values-title">What drives SwiftMint</h2>
        </div>
        <div className="benefit-grid">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <article className="benefit-card" key={v.title}>
                <span className="icon-shell">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="info-band" aria-labelledby="about-contact">
        <Users size={26} aria-hidden="true" />
        <div>
          <h2 id="about-contact">Get in touch</h2>
          <p>
            Reach SwiftMint on WhatsApp at {formattedWhatsappNumber} for transfer
            requests, pricing, or any questions about our service.
          </p>
        </div>
      </section>
    </main>
  );
}
