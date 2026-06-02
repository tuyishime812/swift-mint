import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {ctaLabel && ctaHref ? (
          <Link className="button button-primary page-hero-cta" href={ctaHref}>
            {ctaLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
