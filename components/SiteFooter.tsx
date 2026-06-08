import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { countries, formattedWhatsappNumber, whatsappNumber } from "@/lib/swiftmint";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <strong className="footer-heading">Company</strong>
          <Link href="/about">About Us</Link>
          <Link href="/service">Our Service</Link>
          <Link href="/news">News & Insights</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <strong className="footer-heading">Products</strong>
          <Link href="/transfer">Send Money</Link>
          <Link href="/wallet">SwiftMint Wallet</Link>
          <Link href="/pay">SwiftMint Pay</Link>
          <Link href="/rates">Check Rates</Link>
        </div>
        <div className="footer-col">
          <strong className="footer-heading">Send to</strong>
          {countries.map((c) => (
            <Link key={c.slug} href={`/countries/${c.slug}`}>
              <Image
                src={`https://flagcdn.com/48x36/${c.code.toLowerCase()}.png`}
                alt=""
                width={16}
                height={12}
                className="footer-flag"
              />
              {c.name}
            </Link>
          ))}
        </div>
        <div className="footer-col">
          <strong className="footer-heading">My Account</strong>
          <Link href="/signup">Sign Up</Link>
          <Link href="/login">Login</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/transfer">New Transfer</Link>
        </div>
        <div className="footer-col">
          <strong className="footer-heading">Support</strong>
          <Link href="/faq">FAQ</Link>
          <Link href="/locations">Branches & Booths</Link>
          <Link href="/partners">Pay-in & Payout Partners</Link>
          <Link href="/fraud-prevention">Fraud Prevention</Link>
          <Link href="/contact">Get in Touch</Link>
          <a href={`https://wa.me/${whatsappNumber}`}>
            <MessageCircle size={16} aria-hidden="true" />
            {formattedWhatsappNumber}
          </a>
        </div>
        <div className="footer-col">
          <strong className="footer-heading">Legal</strong>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/faq">FAQs</Link>
        </div>
        <div className="footer-col footer-brand-col">
          <strong className="footer-brand">SwiftMint Exchange</strong>
          <span className="footer-tagline">
            Premium Outbound Mobile Money Facilitation from Malawi.
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} SwiftMint Exchange. All rights reserved.</span>
        <span className="footer-compliance">Business Registration &bull; Licensed Money Transfer Facilitator</span>
      </div>
    </footer>
  );
}
