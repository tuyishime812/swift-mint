import type { Metadata } from "next";
import { Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber, whatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach SwiftMint Exchange on WhatsApp for transfer requests, pricing confirmation, and service questions.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Reach SwiftMint on WhatsApp"
        description="For transfer requests, pricing confirmation, and service questions, customers should contact SwiftMint Exchange directly on WhatsApp."
        ctaLabel="Open WhatsApp"
        ctaHref={`https://wa.me/${whatsappNumber}`}
      />

      <section className="section contact-grid" aria-labelledby="contact-options">
        <article>
          <MessageCircle size={26} aria-hidden="true" />
          <h2 id="contact-options">WhatsApp</h2>
          <p>{formattedWhatsappNumber}</p>
          <a className="button button-primary" href={`https://wa.me/${whatsappNumber}`}>
            Open WhatsApp
          </a>
        </article>
        <article>
          <ShieldCheck size={26} aria-hidden="true" />
          <h2>Before processing</h2>
          <p>
            SwiftMint confirms destination, wallet, recipient details, and
            expected payout value before processing.
          </p>
        </article>
        <article>
          <Mail size={26} aria-hidden="true" />
          <h2>Best message format</h2>
          <p>
            Country, recipient name, wallet type, recipient number, and amount in
            MWK.
          </p>
        </article>
      </section>
    </main>
  );
}
