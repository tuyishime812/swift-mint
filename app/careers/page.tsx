import type { Metadata } from "next";
import { Briefcase, MapPin, Clock, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the SwiftMint Exchange team and help build Africa's leading mobile money transfer platform.",
};

const roles = [
  {
    title: "Customer Support Associate",
    location: "Lilongwe, Malawi",
    type: "Full-time",
    description: "Help customers navigate the transfer process via WhatsApp and ensure a smooth experience from request to payout.",
  },
  {
    title: "Business Development Manager",
    location: "Lilongwe, Malawi",
    type: "Full-time",
    description: "Expand SwiftMint's corridor network and build partnerships with mobile money operators across Africa.",
  },
  {
    title: "Mobile Money Operations Analyst",
    location: "Remote",
    type: "Contract",
    description: "Monitor payout operations, reconcile transactions, and optimise mobile wallet processing across supported corridors.",
  },
];

export default function CareersPage() {
  return (
    <main>
      <PageHero
        eyebrow="Careers"
        title="Join the SwiftMint team"
        description="Help us build a faster, more transparent way to send mobile money across Africa."
        ctaLabel="View open roles"
        ctaHref="#roles"
      />

      <section className="section" aria-labelledby="culture-title">
        <div className="section-heading">
          <p className="eyebrow">Working at SwiftMint</p>
          <h2 id="culture-title">Build the future of cross-border payments</h2>
          <p>
            We are a small, focused team dedicated to making mobile money transfers
            simpler and more accessible. We value initiative, clear communication,
            and a customer-first mindset.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="roles-title" id="roles">
        <div className="section-heading">
          <p className="eyebrow">Open positions</p>
          <h2 id="roles-title">Current vacancies</h2>
        </div>
        <div className="careers-grid">
          {roles.map((r) => (
            <article className="careers-card" key={r.title}>
              <h3>{r.title}</h3>
              <div className="careers-meta">
                <span>
                  <MapPin size={15} aria-hidden="true" />
                  {r.location}
                </span>
                <span>
                  <Briefcase size={15} aria-hidden="true" />
                  {r.type}
                </span>
              </div>
              <p>{r.description}</p>
              <button className="button button-primary" type="button">
                Apply now
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="info-band" aria-labelledby="careers-contact">
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2 id="careers-contact">Don&apos;t see the right role?</h2>
          <p>
            Reach out on WhatsApp at {formattedWhatsappNumber} and tell us how you
            can contribute to SwiftMint.
          </p>
        </div>
      </section>
    </main>
  );
}
