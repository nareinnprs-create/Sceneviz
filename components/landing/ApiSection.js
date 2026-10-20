import { localizeHref } from './paths';

export default function ApiSection({ copy = {}, locale }) {
  const steps = Array.isArray(copy.steps) ? copy.steps : [];

  return (
    <section id="api" className="w-full border-b border-divider bg-bg-page px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex w-full min-w-0 flex-col gap-6 lg:w-1/2">
          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-secondary-text">{copy.eyebrow}</p>
            <h2 className="font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">{copy.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-secondary-text sm:text-lg">{copy.description}</p>
          </div>
          {copy.cta && (
            <div>
              <a
                href={localizeHref(locale, copy.href) || '#'}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-[#101319] transition-opacity hover:opacity-90"
              >
                {copy.cta}
              </a>
            </div>
          )}
        </div>
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-divider bg-bg-elevated lg:w-1/2">
          <div className="relative flex items-center gap-2 overflow-hidden border-b border-divider bg-bg-card px-4 py-3">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#ff5f57]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#febc2e]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#28c840]" aria-hidden="true" />
            <span className="absolute left-1/2 max-w-[70%] -translate-x-1/2 truncate font-mono text-xs text-secondary-text">
              {copy.terminal || 'api'}
            </span>
          </div>
          <div className="divide-y divide-divider">
            {steps.map((step, index) => (
              <div key={step?.num ?? index} className="flex flex-col gap-2.5 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold text-[#101319]">
                    {step?.num}
                  </span>
                  <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-widest text-secondary-text">{step?.label}</span>
                </div>
                <div className="max-w-full overflow-x-auto rounded-lg border border-divider bg-bg-page/60 px-3.5 py-2.5 scrollbar-none">
                  <code className="block whitespace-pre font-mono text-[13px] leading-relaxed text-primary-text">{step?.code}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
