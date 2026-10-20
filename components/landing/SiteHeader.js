'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';
import { localizeHref } from './paths';

const THEME_OPTIONS = ['system', 'light', 'dark'];

function SystemIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ChevronIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MenuIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" stroke="currentColor" fill="currentColor" aria-hidden="true">
      <path fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="48" d="M88 152h336M88 256h336M88 360h336" />
    </svg>
  );
}

function CloseIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" stroke="currentColor" fill="currentColor" aria-hidden="true">
      <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z" />
    </svg>
  );
}

function themeLabel(copy, value) {
  if (value === 'light') return copy.themeLight;
  if (value === 'dark') return copy.themeDark;
  return copy.themeSystem;
}

function themeIcon(value) {
  if (value === 'light') return <SunIcon />;
  if (value === 'dark') return <MoonIcon />;
  return <SystemIcon />;
}

export default function SiteHeader({ copy, locale, theme, onThemeChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: copy.studio, href: localizeHref(locale, copy.studioHref) },
    { label: copy.models, href: copy.modelsHref },
    { label: copy.tools, href: '#tools' },
    { label: copy.features, href: copy.featuresHref },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 w-full transition-all duration-500 flex flex-col items-center backdrop-blur-md border-b ${
          scrolled
            ? 'bg-bg-page/75 border-divider shadow-[0_10px_30px_-16px_rgba(0,0,0,0.65)]'
            : 'bg-bg-page/40 border-divider/70'
        }`}
      >
        <div className="flex items-center justify-between py-1.5 w-full max-w-[90%] xl:max-w-[1400px] gap-6">
          <div className="flex items-center gap-8 py-4">
            <a
              href={localizeHref(locale, '/')}
              aria-label="Sceneviz"
              className="flex items-center gap-2.5 flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Logo className="h-7 w-auto" gradientId="sceneviz-header-mark" />
              <span className="font-display text-lg font-bold tracking-tight text-primary-text">Sceneviz</span>
            </a>
            <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group inline-flex min-h-9 items-center text-[13px] font-semibold transition-colors relative text-secondary-text hover:text-primary-text focus-visible:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full group-focus-visible:w-full" />
                  </span>
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4 justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={themeOpen}
                aria-label={copy.themeLabel}
                className="flex items-center justify-center gap-2 border px-3 py-[6px] rounded-full h-9 bg-bg-elevated cursor-pointer border-divider text-primary-text hover:border-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {themeIcon(theme)}
                <span className="hidden sm:inline text-xs font-semibold">{themeLabel(copy, theme)}</span>
                <ChevronIcon />
              </button>
              {themeOpen ? (
                <>
                  <button
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => setThemeOpen(false)}
                    className="fixed inset-0 z-[60] cursor-default"
                  />
                  <div role="menu" className="absolute right-0 mt-2 w-40 rounded-xl border border-divider bg-bg-elevated shadow-2xl p-1 z-[70]">
                    {THEME_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="menuitemradio"
                        aria-checked={theme === option}
                        onClick={() => {
                          onThemeChange(option);
                          setThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                          theme === option ? 'text-primary bg-primary/10' : 'text-secondary-text hover:bg-bg-card-hover'
                        }`}
                      >
                        {themeIcon(option)}
                        <span className="flex-1 text-left">{themeLabel(copy, option)}</span>
                        {theme === option ? <CheckIcon /> : null}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <a
              href={localizeHref(locale, copy.studioHref)}
              className="hidden sm:inline-flex min-h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-[#101319] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            >
              {copy.cta}
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={copy.openMenu}
              className="lg:hidden p-2 rounded cursor-pointer transition-colors text-primary-text hover:bg-bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[100] lg:hidden ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-[110] h-screen w-[85%] max-w-[320px] bg-bg-page shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center gap-1 justify-between p-5 border-b border-divider">
          <a href={localizeHref(locale, '/')} aria-label="Sceneviz" className="flex items-center gap-2.5">
            <Logo className="h-7 w-auto" gradientId="sceneviz-drawer-mark" />
            <span className="font-display text-lg font-bold tracking-tight text-primary-text">Sceneviz</span>
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={copy.closeMenu}
            className="p-2 hover:bg-bg-card-hover rounded-full transition-colors text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            <span className="text-[10px] uppercase font-bold text-secondary-text tracking-widest px-4 mb-2">{copy.menu}</span>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded text-sm font-semibold transition-colors text-primary-text hover:bg-bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="h-px bg-divider my-4 mx-4" />
          <div className="flex flex-col gap-2 px-2">
            <span className="text-[11px] uppercase font-bold text-secondary-text tracking-wider px-2 mb-1">{copy.themeLabel}</span>
            <div className="flex gap-1">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onThemeChange(option)}
                  className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-2.5 rounded text-xs font-semibold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    theme === option
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-bg-card hover:bg-bg-card-hover text-primary-text border-divider'
                  }`}
                >
                  {themeIcon(option)}
                  <span>{themeLabel(copy, option)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 px-2">
            <a
              href={localizeHref(locale, copy.studioHref)}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center min-h-11 rounded-full bg-primary px-6 text-sm font-bold text-[#101319] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {copy.cta}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
