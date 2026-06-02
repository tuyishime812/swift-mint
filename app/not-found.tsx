import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Not found</p>
          <h1>Page unavailable</h1>
          <p>The page you requested is not part of the SwiftMint frontend.</p>
          <Link className="button button-primary page-hero-cta" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
