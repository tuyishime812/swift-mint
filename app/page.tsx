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
  Users,
} from "lucide-react";
import { CountryCards } from "@/components/CountryCards";
import { PayoutCalculator } from "@/components/PayoutCalculator";
import { PricingCards } from "@/components/PricingCards";
import { TransferForm } from "@/components/TransferForm";
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

const stats = [
  {
    icon: Globe2,
    value: "5",
    label: "Supported countries",
  },
  {
    icon: Smartphone,
    value: "13",
    label: "Mobile wallet options",
  },
  {
    icon: Users,
    value: "100%",
    label: "WhatsApp-based service",
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
            <div className="hero-actions" aria-label="SwiftMint primary actions">
              <Link className="button button-primary" href="/transfer">
                <MessageCircle size={19} aria-hidden="true" />
                Start a transfer
              </Link>
              <Link className="button button-secondary" href="/countries">
                <Globe2 size={19} aria-hidden="true" />
                View countries
              </Link>
            </div>
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
          {stats.map((stat) => {
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
          <p className="eyebrow">Our service</p>
          <h2 id="service-title">Built for outbound mobile payments</h2>
          <p>
            SwiftMint helps customers in Malawi prepare mobile wallet payout
            requests with the right destination details, clear pricing, and
            confirmation before processing.
          </p>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article className="benefit-card" key={benefit.title}>
                <span className="icon-shell">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section split-section" aria-labelledby="workflow-title">
        <div>
          <p className="eyebrow">Customer flow</p>
          <h2 id="workflow-title">A clear request from the first message</h2>
          <p>
            The frontend now mirrors the required SwiftMint intake format and
            prepares a WhatsApp request using the same information customers
            must provide.
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

      <section className="countries-band" aria-labelledby="countries-title">
        <div className="countries-band-inner">
          <div className="section-heading heading-row">
            <div>
              <p className="eyebrow">Supported countries</p>
              <h2 id="countries-title">Mobile wallet payouts across Africa</h2>
            </div>
            <Link className="inline-link" href="/countries">
              Full country list
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="country-flags-row" aria-label="Available countries">
            {countries.map((c) => (
              <div className="country-flag-chip" key={c.slug}>
                <Image
                  src={`https://flagcdn.com/48x36/${c.code.toLowerCase()}.png`}
                  alt=""
                  width={20}
                  height={15}
                  className="chip-flag"
                />
                {c.name}
              </div>
            ))}
          </div>
          <CountryCards />
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
          <h2 id="payment-title">Payment methods customers can use</h2>
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
