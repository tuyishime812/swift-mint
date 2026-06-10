"use client";

import { useEffect, useState } from "react";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import { type TestimonialData, apiGetTestimonials } from "@/lib/api";
import { whatsappNumber, formattedWhatsappNumber } from "@/lib/swiftmint";

export function LiveTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    apiGetTestimonials()
      .then((data) => setTestimonials(data.testimonials))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="testimonial-card" style={{ display: "grid", gap: 14 }}>
                <div className="loading-skeleton">
                  <div className="skeleton-line" style={{ height: 12, width: "40%" }} />
                  <div className="skeleton-line" style={{ height: 48 }} />
                  <div className="skeleton-line" style={{ height: 12, width: "30%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0 || fetchError) {
    return null;
  }

  return (
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
            <blockquote className="testimonial-card" key={t.id}>
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }, (_, i) => (
                  <Star key={i} size={16} fill="var(--accent)" color="var(--accent)" aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <footer className="testimonial-author">
                <strong>{t.name}</strong>
                {t.location ? <span>{t.location}</span> : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
