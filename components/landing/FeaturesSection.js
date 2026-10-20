import { localizeHref } from './paths';

const FEATURE_ICONS = [
  (
    <svg key="studio" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  (
    <svg key="workflow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9M12 15v0" />
    </svg>
  ),
  (
    <svg key="agents" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  ),
];

export default function FeaturesSection({ copy, locale }) {
  return (
    <section id="features" className="w-full border-b border-divider bg-bg-page px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div className="max-w-3xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-secondary-text">{copy.eyebrow}</p>
          <h2 className="font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">{copy.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary-text sm:text-lg">{copy.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {copy.items.map((feature, index) => (
            <a
              key={feature.title}
              href={localizeHref(locale, feature.href)}
              className="group flex flex-col gap-3 rounded-2xl border border-divider bg-bg-card p-6 transition-all hover:border-primary/50 hover:bg-bg-card-hover"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-divider bg-bg-elevated text-accent-text">
                {FEATURE_ICONS[index % FEATURE_ICONS.length]}
              </span>
              <h3 className="font-display text-lg font-bold text-primary-text">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-secondary-text">{feature.description}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-accent-text">
                {feature.cta}
                <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
