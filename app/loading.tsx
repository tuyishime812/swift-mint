export default function Loading() {
  return (
    <main>
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="loading-skeleton">
            <div className="skeleton-line skeleton-eyebrow" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text short" />
          </div>
        </div>
      </section>
    </main>
  );
}
