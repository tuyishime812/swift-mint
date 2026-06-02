import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Smartphone } from "lucide-react";
import { countries, type Country, whatsappNumber } from "@/lib/swiftmint";
import { PageHero } from "@/components/PageHero";

type Props = { params: Promise<{ slug: string }> };

function findCountry(slug: string): Country | undefined {
  return countries.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = findCountry(slug);
  if (!country) return { title: "Country Not Found" };

  return {
    title: `Send to ${country.name}`,
    description: `Send mobile wallet payouts from Malawi to ${country.name} via SwiftMint Exchange. Supported wallets: ${country.wallets.join(", ")}.`,
  };
}

export function generateStaticParams() {
  return countries.map((c) => ({ slug: c.slug }));
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = findCountry(slug);

  if (!country) notFound();

  const totalWallets = country.wallets.length;

  return (
    <main>
      <PageHero
        eyebrow={`Send to ${country.name}`}
        title={`Send to ${country.name}`}
        description={country.note}
        ctaLabel="Start a transfer"
        ctaHref="/transfer"
      />

      <section className="section stats-row" aria-label={`${country.name} summary`}>
        <div>
          <strong>{totalWallets}</strong>
          <span>supported wallet{totalWallets !== 1 ? "s" : ""}</span>
        </div>
        <div>
          <strong>{country.name}</strong>
          <span>destination country</span>
        </div>
        <div>
          <strong>Mobile</strong>
          <span>wallet payouts only</span>
        </div>
      </section>

      <section className="section" aria-labelledby="wallets-title">
        <div className="section-heading">
          <p className="eyebrow">Mobile wallets</p>
          <h2 id="wallets-title">Supported in {country.name}</h2>
          <p>
            These mobile wallets are available for outbound payouts to{" "}
            {country.name}. SwiftMint confirms the best option at processing
            time.
          </p>
        </div>
        <div className="wallet-detail-grid">
          {country.wallets.map((wallet) => (
            <article className="benefit-card" key={wallet}>
              <span className="icon-shell">
                <Smartphone size={23} aria-hidden="true" />
              </span>
              <h3>{wallet}</h3>
              <p>
                Send money directly to {wallet} in {country.name}. Recipient
                receives the payout in their mobile wallet.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-section" aria-labelledby="how-title">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">Sending to {country.name}</h2>
          <p>
            The process is straightforward. Submit the details and SwiftMint
            confirms the payout value before processing.
          </p>
        </div>
        <div className="workflow-list">
          <div>
            <span>01</span>
            <strong>Choose {country.name}</strong>
            <p>Select {country.name} as the destination country and pick a wallet.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Enter recipient details</strong>
            <p>Provide the recipient name, mobile number, and amount in MWK.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Confirm on WhatsApp</strong>
            <p>SwiftMint confirms expected payout before processing the request.</p>
          </div>
        </div>
      </section>

      <section className="cta-band" aria-labelledby="country-cta">
        <div>
          <p className="eyebrow">Ready to send</p>
          <h2 id="country-cta">Send money to {country.name}</h2>
          <p>Prepare your WhatsApp request with all the right details.</p>
        </div>
        <div className="cta-actions">
          <Link className="button button-light" href="/transfer">
            <MessageCircle size={19} aria-hidden="true" />
            Start transfer
          </Link>
          <Link className="button cta-back" href="/countries">
            <ArrowLeft size={18} aria-hidden="true" />
            All countries
          </Link>
        </div>
      </section>
    </main>
  );
}
