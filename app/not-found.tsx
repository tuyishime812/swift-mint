import Link from "next/link";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";

export default function NotFound() {
  return (
    <main className="nf-main">
      <section className="nf-hero">
        <div className="nf-hero-inner">
          <span className="nf-code">404</span>
          <p className="eyebrow nf-eyebrow">Page not found</p>
          <h1 className="nf-title">This page doesn&apos;t exist</h1>
          <p className="nf-desc">
            The page you requested is not part of SwiftMint. It may have been
            moved, deleted, or the link was incorrect.
          </p>
          <div className="nf-actions">
            <Link className="button button-primary" href="/">
              <Home size={18} aria-hidden="true" />
              Go home
            </Link>
            <Link className="button button-secondary" href="/transfer">
              <MessageCircle size={18} aria-hidden="true" />
              Start a transfer
            </Link>
          </div>
        </div>
      </section>

      <section className="nf-links" aria-label="Available pages">
        <div className="nf-links-inner">
          <strong className="nf-links-heading">Popular pages</strong>
          <div className="nf-grid">
            <Link href="/service">Our Service</Link>
            <Link href="/countries">Supported Countries</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/transfer">Transfer Request</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/pay">Make a Payment</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="nf-whatsapp">
            <MessageCircle size={20} aria-hidden="true" />
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              WhatsApp: {formattedWhatsappNumber}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
