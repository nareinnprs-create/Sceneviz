import { localizeHref } from './paths';

// Provider brand colors come from copy and may be near-white (e.g. #e5e7eb),
// which is invisible on the light-theme card. Return null for those so the
// caller falls back to the semantic secondary token instead.
function resolveDotColor(color) {
  if (typeof color !== 'string' || !color.trim()) return null;
  const value = color.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!match) return value;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map((chunk) => chunk + chunk).join('');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.82 ? null : `#${hex.toLowerCase()}`;
}

export default function ProvidersSection({ copy, locale }) {
  const items = Array.isArray(copy?.items) ? copy.items : [];
  const ctaHref = localizeHref(locale, copy?.ctaHref) || '#';

  return (
    <section id="providers" className="w-full border-b border-divider bg-bg-page px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div className="max-w-3xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-secondary-text">{copy?.eyebrow}</p>
          <h2 className="font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">{copy?.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary-text sm:text-lg">{copy?.description}</p>
        </div>
        <ul className="flex max-w-full flex-wrap gap-3" aria-label={copy?.ariaLabel}>
          {items.map((provider, index) => {
            const dotColor = resolveDotColor(provider?.color);
            return (
              <li key={provider?.name ?? index} className="flex max-w-full">
                <a
                  href={ctaHref}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-divider bg-bg-card px-4 py-2 text-sm font-semibold text-primary-text transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-divider ${dotColor ? '' : 'bg-secondary'}`}
                    style={dotColor ? { backgroundColor: dotColor } : undefined}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words">{provider?.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {copy?.cta ? (
            <a
              href={ctaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-[#101319] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {copy.cta}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
