import type { Metadata } from "next";
import { Globe2 } from "lucide-react";
import { CountryCards } from "@/components/CountryCards";
import { PageHero } from "@/components/PageHero";
import { countries } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Supported Countries",
  description:
    "SwiftMint supports outbound mobile wallet payout requests from Malawi to Kenya, Tanzania, Uganda, Zambia, and Ghana.",
};

export default function CountriesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Supported countries"
        title="Mobile wallet payout corridors"
        description="SwiftMint currently supports outbound mobile wallet payout requests from Malawi to Kenya, Tanzania, Uganda, Zambia, and Ghana."
        ctaLabel="Request a transfer"
        ctaHref="/transfer"
      />

      <section className="section stats-row" aria-label="Country coverage summary">
        <div>
          <strong>{countries.length}</strong>
          <span>supported countries</span>
        </div>
        <div>
          <strong>
            {countries.reduce((count, country) => count + country.wallets.length, 0)}
          </strong>
          <span>listed wallet options</span>
        </div>
        <div>
          <strong>Mobile</strong>
          <span>destination payouts only</span>
        </div>
      </section>

      <section className="section countries-section" aria-labelledby="country-list">
        <div className="section-heading">
          <p className="eyebrow">Country list</p>
          <h2 id="country-list">Available destination options</h2>
          <p>
            Wallet availability is confirmed during processing. SwiftMint selects
            the most favourable available payout option at the time of transaction.
          </p>
        </div>
        <CountryCards />
      </section>

      <section className="info-band" aria-labelledby="country-info">
        <Globe2 size={26} aria-hidden="true" />
        <div>
          <h2 id="country-info">No destination bank payout selection</h2>
          <p>
            The public service is presented as mobile money focused, which keeps
            customer instructions clear and avoids bank verification delays.
          </p>
        </div>
      </section>
    </main>
  );
}
