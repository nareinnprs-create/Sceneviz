import Logo from './Logo';
import { localizeHref } from './paths';

export default function SiteFooter({ copy, locale }) {
  return (
    <footer id="site-footer" className="w-full border-t border-divider bg-bg-page text-primary-text">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-14 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 space-y-5 md:col-span-4 lg:col-span-1">
            <a
              href={localizeHref(locale, '/')}
              aria-label="Sceneviz"
              className="inline-flex items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Logo className="h-7 w-auto" gradientId="sceneviz-footer-mark" />
              <span className="font-display text-lg font-bold tracking-tight text-primary-text">Sceneviz</span>
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-secondary-text">{copy.tagline}</p>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-text">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary ring-2 ring-primary/20 animate-pulse" aria-hidden="true" />
              {copy.status}
            </span>
          </div>

          {copy.columns.map((column) => (
            <div key={column.title} className="min-w-0 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary-text">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={localizeHref(locale, link.href)}
                      className="rounded text-sm text-secondary-text transition-colors hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-divider pt-8 text-sm text-secondary-text md:flex-row md:items-center md:justify-between">
          <p>{copy.copyright}</p>
          <nav aria-label={copy.language} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            <span className="mr-1 font-semibold text-primary-text">{copy.language}</span>
            {copy.languages.map((language, index) => {
              const isActive = (locale === 'zh') === language.href.startsWith('/zh');
              return (
                <span key={language.code} className="inline-flex items-center gap-2">
                  {index > 0 ? (
                    <span aria-hidden="true" className="select-none text-secondary-text">
                      /
                    </span>
                  ) : null}
                  <a
                    href={language.href}
                    className={`inline-flex min-h-6 items-center rounded px-1 transition-colors hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      isActive ? 'font-bold text-primary-text underline' : ''
                    }`}
                  >
                    {language.label}
                  </a>
                </span>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
