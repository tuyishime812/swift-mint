import Link from "next/link";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";

export default function NotFound() {
  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Error 404</p>
          <h1>Page not found</h1>
          <p>The page you requested is not part of the SwiftMint frontend.</p>
          <div className="not-found-actions">
            <Link className="button button-primary page-hero-cta" href="/">
              <Home size={18} aria-hidden="true" />
              Go home
            </Link>
            <Link className="button button-secondary page-hero-cta" href="/transfer">
              <MessageCircle size={18} aria-hidden="true" />
              Start a transfer
            </Link>
          </div>
        </div>
      </section>

      <section className="section not-found-links" aria-label="Available pages">
        <strong>Available pages</strong>
        <div className="not-found-grid">
          <Link href="/service">Our Service</Link>
          <Link href="/countries">Supported Countries</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/transfer">Transfer Request</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pay">Make a Payment</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="request-note" style={{ marginTop: 24 }}>
          <MessageCircle size={20} aria-hidden="true" />
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp: {formattedWhatsappNumber}</a>
        </div>
      </section>
    </main>
  );
}
