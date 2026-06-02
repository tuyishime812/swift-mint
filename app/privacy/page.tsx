import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SwiftMint Exchange privacy policy outlining how customer data is collected, used, and protected.",
};

export default function PrivacyPage() {
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How SwiftMint Exchange collects, uses, and protects your personal information."
      />

      <section className="section">
        <div className="legal-content">
          <h3>Information We Collect</h3>
          <p>
            When you submit a transfer request, we collect the information you provide: your name,
            recipient name, recipient mobile number, destination country, wallet type, and transfer
            amount. This information is necessary to prepare and process your transfer request.
          </p>

          <h3>How We Use Your Information</h3>
          <p>
            We use your information exclusively to facilitate your transfer request, communicate
            with you via WhatsApp about your request status, and improve our service quality.
          </p>

          <h3>Data Sharing</h3>
          <p>
            SwiftMint does not sell, trade, or share your personal information with third parties
            except as required to process your transfer request or as required by law.
          </p>

          <h3>Data Retention</h3>
          <p>
            We retain your transfer request information for as long as necessary to fulfill the
            service and comply with legal obligations. You may request deletion of your data by
            contacting us on WhatsApp.
          </p>

          <h3>Security</h3>
          <p>
            We implement reasonable security measures to protect your information. However, no
            method of electronic storage or transmission is 100% secure.
          </p>

          <h3>Contact</h3>
          <p>
            For privacy-related inquiries, contact us on WhatsApp at {formattedWhatsappNumber}.
          </p>
        </div>
      </section>
    </main>
  );
}
