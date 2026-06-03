import type { Metadata } from "next";
import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formattedWhatsappNumber } from "@/lib/swiftmint";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "Latest news, updates, and insights from SwiftMint Exchange about mobile money transfers in Africa.",
};

const articles = [
  {
    date: "2 June 2026",
    title: "SwiftMint expands wallet options for Tanzania corridor",
    excerpt:
      "Customers sending to Tanzania can now choose from M-Pesa, Airtel Money, Tigo Pesa, and HaloPesa for more flexible payouts.",
  },
  {
    date: "15 May 2026",
    title: "Understanding transfer fees: Standard vs VIP pricing",
    excerpt:
      "A detailed breakdown of how SwiftMint calculates service fees, including the reduced VIP rate for larger transfers.",
  },
  {
    date: "28 April 2026",
    title: "Why WhatsApp is the best channel for transfer requests",
    excerpt:
      "Learn how SwiftMint uses WhatsApp to provide a seamless, professional, and secure transfer experience.",
  },
  {
    date: "10 April 2026",
    title: "New corridor: Send mobile wallet payouts to Ghana",
    excerpt:
      "SwiftMint now supports MTN MoMo, Vodafone Cash, and AirtelTigo Money payouts in Ghana.",
  },
  {
    date: "22 March 2026",
    title: "How to prepare a complete transfer request",
    excerpt:
      "A step-by-step guide to submitting the right details for fast and accurate mobile wallet payouts.",
  },
];

export default function NewsPage() {
  return (
    <main>
      <PageHero
        eyebrow="News & insights"
        title="Latest updates from SwiftMint"
        description="Stay informed about new corridors, service updates, and tips for sending money through SwiftMint Exchange."
      />

      <section className="section" aria-labelledby="articles-title">
        <div className="section-heading">
          <h2 id="articles-title">Recent articles</h2>
        </div>
        <div className="news-grid">
          {articles.map((a) => (
            <article className="news-card" key={a.title}>
              <span className="news-date">
                <Calendar size={14} aria-hidden="true" />
                {a.date}
              </span>
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
              <span className="inline-link">
                Read more
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="info-band" aria-labelledby="news-contact">
        <MessageCircle size={26} aria-hidden="true" />
        <div>
          <h2 id="news-contact">Have a question?</h2>
          <p>
            Contact SwiftMint on WhatsApp at {formattedWhatsappNumber} for
            personalised assistance with your transfer needs.
          </p>
        </div>
      </section>
    </main>
  );
}
