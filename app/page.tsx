import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import { PayoutCalculator } from "@/components/PayoutCalculator";
import { PricingCards } from "@/components/PricingCards";
import { TransferForm } from "@/components/TransferForm";
import { HomeActions } from "@/components/HomeActions";
import { acceptedPaymentMethods, countries, formattedWhatsappNumber } from "@/lib/swiftmint";

const benefits = [
  {
    icon: Smartphone,
    title: "Mobile money only",
    text: "Customer requests are prepared for supported mobile wallet payouts across selected African corridors.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmed before processing",
    text: "SwiftMint confirms request details and expected payout value before a customer authorizes processing.",
  },
  {
    icon: LockKeyhole,
    title: "Professional handling",
    text: "Each request follows a structured intake flow with clear recipient, wallet, country, and amount details.",
  },
];

const whyMukuru = [
  {
    icon: Users,
    title: "Trusted by customers across Malawi",
    text: "SwiftMint provides a professional, structured transfer experience for individuals and businesses.",
  },
  {
    icon: Smartphone,
    title: "Quick and easy transfers",
    text: "Start a transfer on WhatsApp with just a few details. SwiftMint handles the rest.",
  },
  {
    icon: Globe2,
    title: "Over 320,000 payout touchpoints",
    text: "Through our network of mobile wallet partners, recipients can receive money at thousands of locations across Africa.",
  },
  {
    icon: ShieldCheck,
    title: "International transfers",
    text: `Send money directly to mobile wallets in ${countries.length} countries across Africa and beyond.`,
  },
];

const testimonials = [
  {
    name: "Grace M.",
    location: "Lilongwe",
    text: "SwiftMint made it so easy to send money to my sister in Kenya. The WhatsApp process is straightforward and I knew the exact payout before approving.",
    stars: 5,
  },
  {
    name: "Peter K.",
    location: "Blantyre",
    text: "I send money to Tanzania every month for my business. SwiftMint's pricing is transparent and the confirmation before processing gives me peace of mind.",
    stars: 5,
  },
  {
    name: "Chifundo B.",
    location: "Mzuzu",
    text: "The dashboard helps me track all my transfers in one place. Customer service on WhatsApp is always responsive and helpful.",
    stars: 5,
  },
];

const services = [
  {
    icon: Smartphone,
    title: "Send Money",
    text: `Fast, reliable mobile wallet payouts to over ${countries.length} countries across Africa with clear pricing and confirmation before processing.`,
    href: "/transfer",
  },
  {
    icon: Globe2,
    title: "SwiftMint Wallet",
    text: "The convenient way to send and receive money, track your transfer history, and manage your account from one dashboard.",
    href: "/wallet",
  },
  {
    icon: MessageCircle,
    title: "SwiftMint Pay",
    text: "Pay for your transfers using Airtel Money, TNM Mpamba, or National Bank Transfer with simple step-by-step instructions.",
    href: "/pay",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Premium Outbound Mobile Money Facilitation</p>
            <h1 id="hero-title">SwiftMint Exchange</h1>
            <p className="hero-lede">
              Secure outbound mobile payments from Malawi to selected African
              countries, handled through supported mobile money networks.
            </p>
            <HomeActions />
            <div className="trust-row" aria-label="Service highlights">
              <span>
                <CheckCircle2 size={17} aria-hidden="true" />
                Fast
              </span>
              <span>
                <CheckCircle2 size={17} aria-hidden="true" />
                Secure
              </span>
              <span>
                <CheckCircle2 size={17} aria-hidden="true" />
                Professional
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <Image
              src="/swiftmint-hero.png"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="SwiftMint by the numbers">
        <div className="stats-grid">
          {[
            { icon: Globe2, value: String(countries.length), label: "Supported countries" },
            { icon: Smartphone, value: String(new Set(countries.flatMap(c => c.wallets)).size), label: "Mobile wallet options" },
            { icon: Users, value: "100%", label: "WhatsApp-based service" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="stat-card" key={stat.label}>
                <span className="stat-icon">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <strong className="stat-value">{stat.value}</strong>
                <span className="stat-label">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section service-section" aria-labelledby="service-title">
        <div className="section-heading">
          <p className="eyebrow">SwiftMint Services</p>
          <h2 id="service-title">What would you like to do?</h2>
          <p>
            SwiftMint offers a fast, reliable and affordable way to send money home
            to over {countries.length} countries across Africa with multiple mobile wallet options.
          </p>
        </div>
        <div className="services-grid">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link className="service-card" key={s.title} href={s.href}>
                <span className="icon-shell">
                  <Icon size={28} aria-hidden="true" />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="service-card-link">
                  Find out more
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="why-band" aria-labelledby="why-title">
        <div className="why-band-inner">
          <div className="section-heading">
            <p className="eyebrow">Why SwiftMint?</p>
            <h2 id="why-title">Built for reliable mobile money transfers</h2>
          </div>
          <div className="why-grid">
            {whyMukuru.map((w) => {
              const Icon = w.icon;
              return (
                <div className="why-card" key={w.title}>
                  <span className="why-icon">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <strong>{w.title}</strong>
                  <p>{w.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section split-section" aria-labelledby="workflow-title">
        <div>
          <p className="eyebrow">Customer flow</p>
          <h2 id="workflow-title">A clear request from the first message</h2>
          <p>
            SwiftMint helps customers in Malawi prepare mobile wallet payout
            requests with the right destination details, clear pricing, and
            confirmation before processing.
          </p>
        </div>
        <div className="workflow-list">
          <div>
            <span>01</span>
            <strong>Choose destination and wallet</strong>
            <p>Select a supported country and the recipient mobile wallet.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Enter recipient details</strong>
            <p>Provide the full name, mobile number, and amount in MWK.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Confirm on WhatsApp</strong>
            <p>SwiftMint responds with confirmation and expected payout value.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section" aria-labelledby="testimonials-title">
        <div className="section testimonials-section-inner">
          <div className="section-heading">
            <p className="eyebrow">What our customers say</p>
            <h2 id="testimonials-title">Trusted by customers across Malawi</h2>
            <p>
              We help our customers and their loved ones send and receive money
              easily. Here&apos;s what they have to say about SwiftMint.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <blockquote className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">
                  {Array.from({ length: t.stars }, (_, i) => (
                    <Star key={i} size={16} fill="var(--accent)" color="var(--accent)" aria-hidden="true" />
                  ))}
                </div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <footer className="testimonial-author">
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-band" aria-labelledby="pricing-title">
        <div>
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title">Simple, transparent service fees</h2>
          <p>
            Final payout amounts are calculated at the moment of processing,
            selecting the most favourable available payout option.
          </p>
        </div>
        <PricingCards />
      </section>

      <section className="section split-section" aria-labelledby="calculator-title">
        <div>
          <p className="eyebrow">Fee calculator</p>
          <h2 id="calculator-title">Estimate your payout</h2>
          <p>
            Use the calculator to see an estimated fee and payout for your
            transfer request. Actual amounts are confirmed at processing time.
          </p>
        </div>
        <PayoutCalculator />
      </section>

      <section className="section split-section" aria-labelledby="payment-title">
        <div>
          <p className="eyebrow">Accepted in Malawi</p>
          <h2 id="payment-title">Payment methods you can use</h2>
          <p>
            SwiftMint accepts common local payment methods before confirming the
            outbound mobile wallet payout request.
          </p>
        </div>
        <div className="method-grid">
          {acceptedPaymentMethods.map((method) => (
            <div key={method}>
              <Clock3 size={20} aria-hidden="true" />
              <span>{method}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section request-section" aria-labelledby="request-title">
        <div className="request-copy">
          <p className="eyebrow">Transfer request</p>
          <h2 id="request-title">Prepare your WhatsApp request</h2>
          <p>
            Submit the form and the app will call the transfer request endpoint,
            validate the details, and open WhatsApp with a structured message.
          </p>
          <div className="request-note">
            <MessageCircle size={20} aria-hidden="true" />
            <span>WhatsApp: {formattedWhatsappNumber}</span>
          </div>
        </div>
        <TransferForm />
      </section>
    </main>
  );
}
