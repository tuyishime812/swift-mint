"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, ShieldCheck, MapPin, Mail } from "lucide-react";
import { formattedWhatsappNumber, whatsappNumber } from "@/lib/swiftmint";

export function SiteFooter() {
  const pathname = usePathname();
  // App-shell routes use their own layout without the marketing footer
  const appShellRoutes = ["/dashboard", "/wallet", "/transfer", "/pay", "/profile", "/admin"];
  if (appShellRoutes.includes(pathname)) return null;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-section">
          <strong className="footer-brand">SwiftMint Exchange</strong>
          <p className="footer-tagline">
            Premium outbound mobile money facilitation from Malawi to Africa and beyond.
          </p>
          <div className="footer-contact-row">
            <a href={`https://wa.me/${whatsappNumber}`} className="footer-contact-link">
              <MessageCircle size={16} />
              {formattedWhatsappNumber}
            </a>
            <a href="mailto:support@swiftmint.mw" className="footer-contact-link">
              <Mail size={16} />
              support@swiftmint.mw
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
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
            <Link href="/countries">All Countries</Link>
          </div>
          <div className="footer-col">
            <strong className="footer-heading">Account</strong>
            <Link href="/signup">Sign Up</Link>
            <Link href="/login">Login</Link>
            <Link href="/transfer">New Transfer</Link>
          </div>
          <div className="footer-col">
            <strong className="footer-heading">Support</strong>
            <Link href="/faq">FAQ</Link>
            <Link href="/locations">Branches & Booths</Link>
            <Link href="/partners">Partners</Link>
            <Link href="/fraud-prevention">Fraud Prevention</Link>
          </div>
          <div className="footer-col">
            <strong className="footer-heading">Legal</strong>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/faq">FAQs</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>&copy; {new Date().getFullYear()} SwiftMint Exchange. All rights reserved.</span>
          <span className="footer-compliance">Licensed Money Transfer Facilitator &bull; Malawi</span>
        </div>
      </div>
    </footer>
  );
}
