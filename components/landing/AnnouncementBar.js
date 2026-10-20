import { localizeHref } from './paths';

function isExternal(href) {
  return typeof href === 'string' && /^https?:\/\//.test(href);
}

export default function AnnouncementBar({ copy, locale }) {
  return (
    <div
      role="region"
      aria-label={copy.ariaLabel}
      className="w-full bg-gradient-to-r from-[#087F91] via-[#16C5D0] to-[#087F91] bg-[length:200%_auto] md:animate-gradient-x py-2 text-center text-[11px] sm:text-xs font-bold text-white tracking-wide shadow-lg relative z-[60]"
    >
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-0.5">
        {copy.items.map((item, index) => (
          <span key={item.text} className="flex max-w-full flex-wrap items-center justify-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="hidden sm:inline text-white/40">
                ·
              </span>
            ) : null}
            {index === 0 ? (
              <span aria-hidden="true" className="relative flex h-2 w-2 flex-shrink-0">
                <span className="md:animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
            ) : null}
            <span className="min-w-0 break-words" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>
              {item.text}
            </span>
            <a
              href={isExternal(item.href) ? item.href : localizeHref(locale, item.href)}
              {...(isExternal(item.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="shrink-0 whitespace-nowrap px-2.5 py-0.5 bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all md:backdrop-blur-sm text-[11px] sm:text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              {item.cta}
            </a>
          </span>
        ))}
      </div>
    </div>
  );
}
