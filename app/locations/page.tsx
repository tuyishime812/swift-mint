import type { Metadata } from "next";
import { MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Find SwiftMint Exchange locations and contact points in Malawi for mobile money transfer assistance.",
};

const locations = [
  {
    city: "Lilongwe",
    address: "Area 13, City Centre, Lilongwe",
    hours: "Mon-Sat: 08:00-19:00, Sun: 08:00-12:00",
    phone: "+265 995 291 236",
  },
  {
    city: "Blantyre",
    address: "Victoria Avenue, Limbe, Blantyre",
    hours: "Mon-Sat: 08:00-19:00, Sun: 08:00-12:00",
    phone: "+265 995 291 236",
  },
  {
    city: "Mzuzu",
    address: "Katoto Area, Mzuzu City Centre",
    hours: "Mon-Sat: 08:00-19:00, Sun: 08:00-12:00",
    phone: "+265 995 291 236",
  },
];

export default function LocationsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Locations"
        title="Find SwiftMint near you"
        description="Visit any of our locations across Malawi for in-person assistance with your transfer requests."
        ctaLabel="Contact us on WhatsApp"
        ctaHref={`https://wa.me/265882156440`}
      />

      <section className="section" aria-labelledby="branches-title">
        <div className="section-heading">
          <p className="eyebrow">Branches</p>
          <h2 id="branches-title">Our locations in Malawi</h2>
        </div>
        <div className="locations-grid">
          {locations.map((loc) => (
            <article className="location-card" key={loc.city}>
              <h3>{loc.city}</h3>
              <div className="location-detail">
                <MapPin size={16} aria-hidden="true" />
                <span>{loc.address}</span>
              </div>
              <div className="location-detail">
                <Clock size={16} aria-hidden="true" />
                <span>{loc.hours}</span>
              </div>
              <div className="location-detail">
                <Phone size={16} aria-hidden="true" />
                <span>{loc.phone}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-band" aria-labelledby="locations-contact">
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2 id="locations-contact">Prefer WhatsApp?</h2>
          <p>
            Contact SwiftMint on WhatsApp at {formattedWhatsappNumber} for assistance
            without needing to visit a branch.
          </p>
        </div>
      </section>
    </main>
  );
}
