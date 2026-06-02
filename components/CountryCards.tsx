import Image from "next/image";
import { countries } from "@/lib/swiftmint";

export function CountryCards() {
  return (
    <div className="country-grid">
      {countries.map((country) => (
        <article className="country-card" key={country.slug}>
          <div className="country-card-header">
            <Image
              src={`https://flagcdn.com/48x36/${country.code.toLowerCase()}.png`}
              alt=""
              width={24}
              height={18}
              className="country-flag-img"
            />
            <h3>{country.name}</h3>
          </div>
          <p>{country.note}</p>
          <div className="wallet-list" aria-label={`${country.name} wallets`}>
            {country.wallets.map((wallet) => (
              <span key={wallet}>{wallet}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
