import { localizeHref } from './paths';

const RAIL_ICONS = [
  (
    <svg key="image" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  (
    <svg key="video" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  ),
  (
    <svg key="audio" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  (
    <svg key="lipsync" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  ),
  (
    <svg key="layers" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  ),
];

const WAVE = [
  18, 26, 14, 34, 22, 46, 30, 58, 38, 72, 52, 88, 64, 96, 70, 84, 58, 92, 66, 100,
  74, 86, 60, 94, 68, 80, 54, 88, 62, 74, 48, 66, 40, 56, 32, 44, 24, 34, 18, 26,
];

export default function Hero({ copy, locale }) {
  const badgeTabs = String(copy.badge || '')
    .split(/[·•|]/)
    .map((tab) => tab.trim())
    .filter(Boolean);

  return (
    <section className="relative w-full overflow-hidden border-b border-divider bg-bg-page">
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(22,197,208,0.18)_0%,transparent_60%)]" />
          <div className="absolute top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(8,127,145,0.22)_0%,transparent_65%)]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(22,197,208,0.12)_0%,transparent_65%)]" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(22,197,208,0.1) 0 1px, transparent 1px 120px), repeating-linear-gradient(0deg, rgba(22,197,208,0.1) 0 1px, transparent 1px 120px)',
              backgroundSize: '240px 240px',
              maskImage:
                'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
              WebkitMaskComposite: 'destination-in',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20 md:gap-8 md:px-10 md:py-28">
        <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-divider bg-bg-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-secondary-text">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          {copy.badge}
        </span>
        <h1 className="animate-fade-in-up max-w-4xl font-display text-4xl font-bold leading-[1.05] text-primary-text sm:text-6xl lg:text-7xl">
          {copy.titleLead}{' '}
          <span className="bg-gradient-to-r from-primary to-[#087F91] bg-clip-text text-transparent">
            {copy.titleAccent}
          </span>
        </h1>
        <p className="animate-fade-in-up max-w-2xl text-base leading-relaxed text-secondary-text sm:text-lg md:text-xl">
          {copy.subtitle}
        </p>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:gap-4 md:gap-6">
          <a
            href={localizeHref(locale, copy.primaryHref)}
            className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-[#101319] shadow-glow transition-all hover:bg-primary-hover md:px-8 md:py-4 md:text-lg"
          >
            {copy.primaryCta}
          </a>
          <a
            href={copy.secondaryHref}
            className="rounded-full border border-divider bg-bg-card px-6 py-3 text-center text-sm font-bold text-primary-text transition-all hover:bg-bg-card-hover md:px-8 md:py-4 md:text-lg"
          >
            {copy.secondaryCta}
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 pt-3">
          {copy.stats.map((stat) => (
            <span
              key={stat}
              className="rounded-full border border-divider bg-bg-elevated px-3.5 py-1.5 text-xs font-semibold text-secondary-text"
            >
              {stat}
            </span>
          ))}
        </div>

        <div
          className="animate-fade-in-up relative mt-8 hidden w-full max-w-5xl md:mt-12 md:block"
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute -inset-x-8 -bottom-10 -top-6 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_top,rgba(22,197,208,0.22),transparent_70%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-divider bg-bg-card shadow-[0_30px_80px_-32px_rgba(8,127,145,0.55)]">
            <div className="flex items-center gap-3 border-b border-divider bg-bg-elevated/80 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-full border border-divider bg-bg-page/60 px-3 py-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-text" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[11px] font-medium tracking-wide text-secondary-text">sceneviz.opraiz.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden h-5 items-center gap-1.5 rounded-full border border-divider px-2 sm:inline-flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="h-1.5 w-4 rounded-full bg-secondary-text/30" />
                </span>
                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-[#087F91]" />
              </div>
            </div>

            <div className="flex">
              <div className="hidden w-14 flex-col items-center gap-1.5 border-r border-divider bg-bg-elevated/40 py-4 lg:flex">
                {RAIL_ICONS.map((icon, i) => (
                  <span
                    key={i}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      i === 0 ? 'bg-primary/15 text-primary' : 'text-secondary-text'
                    }`}
                  >
                    {icon}
                  </span>
                ))}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                {badgeTabs.length > 0 && (
                  <div className="flex items-center gap-1 overflow-hidden border-b border-divider px-3 pt-3 sm:px-4">
                    {badgeTabs.map((tab, i) => (
                      <span
                        key={`${tab}-${i}`}
                        className={`relative -mb-px whitespace-nowrap rounded-t-lg px-3 py-2 text-xs font-semibold ${
                          i === 0 ? 'text-primary-text' : 'text-secondary-text'
                        }`}
                      >
                        {tab}
                        {i === 0 && (
                          <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 p-3 sm:p-4">
                  <img
                    src="/studio-screenshot.png"
                    alt="Sceneviz studio"
                    width={1400}
                    height={693}
                    className="rounded-xl border border-divider shadow-lg shadow-black/40 object-cover w-full h-full"
                  />

                  <div className="relative overflow-hidden rounded-xl border border-divider bg-bg-elevated/50 p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-6 w-16 rounded-md bg-primary/70" />
                      <span className="h-6 w-10 rounded-md bg-[#0E9AA5]/60" />
                      <span className="h-6 w-24 rounded-md bg-primary/30" />
                      <span className="h-6 w-8 rounded-md bg-[#F2AE43]/55" />
                      <span className="h-6 flex-1 rounded-md bg-secondary-text/15" />
                    </div>
                    <div className="mt-2.5 flex h-8 items-end gap-[3px]">
                      {WAVE.map((h, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-full bg-primary/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <span className="pointer-events-none absolute bottom-2 left-[42%] top-2 w-px bg-primary/70" />
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-divider bg-bg-elevated/60 px-3 py-3 sm:px-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-divider text-secondary-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-divider bg-bg-page/60 px-3 py-2">
                    <span className="h-3.5 w-[2px] animate-pulse rounded-full bg-primary" />
                    <span className="hidden h-2 w-28 rounded-full bg-gradient-to-r from-secondary-text/40 to-transparent sm:block" />
                    <span className="hidden h-2 w-16 rounded-full bg-gradient-to-r from-secondary-text/25 to-transparent md:block" />
                  </div>
                  <span className="hidden items-center gap-1.5 md:flex">
                    <span className="rounded-lg border border-divider px-2 py-1.5 text-[10px] font-semibold text-secondary-text">16:9</span>
                    <span className="rounded-lg border border-divider px-2 py-1.5 text-[10px] font-semibold text-secondary-text">1080p</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[#101319] shadow-glow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
