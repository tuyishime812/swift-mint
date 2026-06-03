import type { Metadata } from "next";
import { MessageCircle, ShieldCheck, AlertTriangle, Eye, LockKeyhole } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Fraud Prevention",
  description:
    "Learn how SwiftMint Exchange protects customers from fraud and what to watch out for when sending money.",
};

const tips = [
  {
    icon: ShieldCheck,
    title: "Verify before you send",
    text: "Always confirm recipient details before initiating a transfer. SwiftMint confirms the expected payout before processing.",
  },
  {
    icon: Eye,
    title: "Use official channels only",
    text: "Only communicate with SwiftMint through the official WhatsApp number. We never ask for your password or PIN.",
  },
  {
    icon: AlertTriangle,
    title: "Watch for unsolicited requests",
    text: "Be cautious of unexpected messages asking you to send money. Always verify through official SwiftMint channels.",
  },
  {
    icon: LockKeyhole,
    title: "Protect your account",
    text: "Use a strong password for your SwiftMint account and never share it with anyone, including SwiftMint staff.",
  },
];

export default function FraudPreventionPage() {
  return (
    <main>
      <PageHero
        eyebrow="Fraud prevention"
        title="Stay safe with SwiftMint"
        description="Protect yourself from fraud when sending money. Follow these guidelines to ensure a secure transfer experience."
      />

      <section className="section" aria-labelledby="fraud-tips">
        <div className="section-heading">
          <p className="eyebrow">Safety guidelines</p>
          <h2 id="fraud-tips">How to protect yourself</h2>
        </div>
        <div className="benefit-grid">
          {tips.map((t) => {
            const Icon = t.icon;
            return (
              <article className="benefit-card" key={t.title}>
                <span className="icon-shell">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="fraud-contacts">
        <div className="section-heading">
          <p className="eyebrow">Official contact details</p>
          <h2 id="fraud-contacts">Only use these channels</h2>
          <p>
            SwiftMint communicates with customers exclusively through the following
            official channels. Any other communication claiming to be SwiftMint
            should be treated as suspicious.
          </p>
        </div>
        <div className="detail-list">
          <div>
            <strong>Official WhatsApp</strong>
            <p>{formattedWhatsappNumber}</p>
          </div>
          <div>
            <strong>Email</strong>
            <p>info@swiftmint.exchange (coming soon)</p>
          </div>
          <div>
            <strong>Office hours</strong>
            <p>Monday-Saturday: 08:00-19:00, Sunday: 08:00-12:00 (CAT)</p>
          </div>
        </div>
      </section>

      <section className="info-band" aria-labelledby="fraud-report">
        <ShieldCheck size={26} aria-hidden="true" />
        <div>
          <h2 id="fraud-report">Report suspicious activity</h2>
          <p>
            If you suspect fraudulent activity, contact SwiftMint immediately on
            WhatsApp at {formattedWhatsappNumber}.
          </p>
        </div>
      </section>
    </main>
  );
}
