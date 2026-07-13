/** Decorative hero visual — CSS + inline SVG, no external assets. */
export function EvHeroShowcase() {
  return (
    <div className="ev-hero-showcase" aria-hidden>
      <div className="ev-showcase-glow" />
      <div className="ev-showcase-ring ev-showcase-ring--outer" />
      <div className="ev-showcase-ring ev-showcase-ring--inner" />

      <svg
        className="ev-showcase-silhouette"
        viewBox="0 0 320 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M36 78h248c6 0 11-5 11-11V58c0-4-2-8-6-10l-28-14c-3-2-7-3-11-3H74c-4 0-8 1-11 3L35 48c-4 2-6 6-6 10v9c0 6 5 11 11 11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M88 48l18-12h108l18 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="92" cy="78" r="14" stroke="currentColor" strokeWidth="2" />
        <circle cx="228" cy="78" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M120 58h80"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      <div className="ev-showcase-metrics">
        <div className="ev-showcase-metric">
          <span className="ev-showcase-metric-value">600+</span>
          <span className="ev-showcase-metric-label">km EPA range</span>
        </div>
        <div className="ev-showcase-metric">
          <span className="ev-showcase-metric-value">350</span>
          <span className="ev-showcase-metric-label">kW DC fast charge</span>
        </div>
        <div className="ev-showcase-metric">
          <span className="ev-showcase-metric-value">5</span>
          <span className="ev-showcase-metric-label">vehicle segments</span>
        </div>
      </div>
    </div>
  );
}
