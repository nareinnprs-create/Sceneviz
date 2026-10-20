import { localizeHref } from './paths';

// Badge text uses the semantic text tokens so it stays readable in both themes.
// The video badge keeps the brand deep-teal (#087F91, docs/brand sceneviz-design-tokens.css)
// for its border/tint; #3AB9C7 was dropped in favour of tokens.
const BADGE_CLASSES = {
  image: 'border-primary/40 bg-primary/10 text-primary-text',
  video: 'border-[#087F91]/50 bg-[#087F91]/15 text-primary-text',
  audio: 'border-secondary/40 bg-secondary/10 text-primary-text',
};

const BADGE_DOTS = {
  image: 'bg-primary',
  video: 'bg-[#087F91]',
  audio: 'bg-secondary',
};

export default function ModelsSection({ copy, locale }) {
  const items = Array.isArray(copy?.items) ? copy.items : [];
  const badges = copy?.badges || {};
  const bottomCta = copy?.bottomCta;
  const browseLabel =
    copy?.browse || (typeof bottomCta === 'string' ? bottomCta : bottomCta?.label) || '';
  const browseHref =
    copy?.browseHref || (typeof bottomCta === 'object' && bottomCta !== null ? bottomCta?.href : null);

  return (
    <section id="models" className="w-full border-b border-divider bg-bg-card px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div className="max-w-3xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-secondary-text">{copy?.eyebrow}</p>
          <h2 className="font-display text-2xl font-black tracking-tight text-primary-text sm:text-3xl">{copy?.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary-text sm:text-lg">{copy?.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {items.map((model, index) => {
            const modality = model?.modality || 'image';
            return (
              <a
                key={model?.name ?? model?.href ?? index}
                href={localizeHref(locale, model?.href) || '#'}
                className="group flex h-full min-w-0 flex-col gap-4 rounded-2xl border border-divider bg-bg-elevated p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="min-w-0 truncate text-[10px] font-bold uppercase tracking-widest text-secondary-text"
                    title={model?.provider}
                  >
                    {model?.provider}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_CLASSES[modality] || BADGE_CLASSES.image}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${BADGE_DOTS[modality] || BADGE_DOTS.image}`}
                      aria-hidden="true"
                    />
                    {badges[modality] || modality}
                  </span>
                </div>
                <h3
                  className="line-clamp-2 min-w-0 break-words font-display text-base font-semibold leading-snug text-primary-text transition-colors group-hover:text-primary"
                  title={model?.name}
                >
                  {model?.name}
                </h3>
                <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-text transition-colors group-hover:text-primary">
                  {browseLabel}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            );
          })}
        </div>
        {browseLabel && browseHref ? (
          <div>
            <a
              href={localizeHref(locale, browseHref)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-divider px-6 py-3 text-sm font-bold text-primary-text transition-colors hover:bg-bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {browseLabel}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
