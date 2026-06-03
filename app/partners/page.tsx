import type { Metadata } from "next";
import { Handshake, MessageCircle, Smartphone, Building } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "SwiftMint Exchange partners with mobile money operators and payment providers across Africa to enable fast payouts.",
};

const partners = [
  {
    name: "Airtel Money",
    countries: "Malawi, Kenya, Tanzania, Uganda, Ghana",
  },
  {
    name: "M-Pesa",
    countries: "Kenya, Tanzania",
  },
  {
    name: "MTN MoMo",
    countries: "Uganda, Zambia, Ghana",
  },
  {
    name: "TNM Mpamba",
    countries: "Malawi",
  },
  {
    name: "National Bank of Malawi",
    countries: "Malawi",
  },
  {
    name: "Tigo Pesa",
    countries: "Tanzania",
  },
  {
    name: "Vodafone Cash",
    countries: "Ghana",
  },
  {
    name: "AirtelTigo Money",
    countries: "Ghana",
  },
  {
    name: "HaloPesa",
    countries: "Tanzania",
  },
];

export default function PartnersPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our partners"
        title="Trusted payment partners across Africa"
        description="SwiftMint works with leading mobile money operators and financial institutions to provide reliable payouts."
      />

      <section className="section" aria-labelledby="partners-title">
        <div className="section-heading">
          <p className="eyebrow">Pay-in & payout partners</p>
          <h2 id="partners-title">Our network of trusted providers</h2>
          <p>
            SwiftMint partners with mobile money operators and banks across Africa to
            ensure fast, reliable payouts for every transfer request.
          </p>
        </div>
        <div className="partners-grid">
          {partners.map((p) => (
            <article className="partner-card" key={p.name}>
              <span className="icon-shell">
                <Building size={22} aria-hidden="true" />
              </span>
              <h3>{p.name}</h3>
              <p>{p.countries}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-band" aria-labelledby="partners-contact">
        <Handshake size={26} aria-hidden="true" />
        <div>
          <h2 id="partners-contact">Become a partner</h2>
          <p>
            Interested in partnering with SwiftMint? Reach out on WhatsApp at{' '}
            {formattedWhatsappNumber} to discuss collaboration opportunities.
          </p>
        </div>
      </section>
    </main>
  );
}
