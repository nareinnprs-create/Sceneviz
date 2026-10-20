'use client';

import { useEffect, useState } from 'react';
import SiteHeader from './SiteHeader';

const THEMES = ['system', 'light', 'dark'];

export default function ThemeShell({ locale, nav, announcement, children }) {
  const [theme, setTheme] = useState('system');
  const [resolved, setResolved] = useState('dark');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('theme');
      if (THEMES.includes(stored)) setTheme(stored);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      setResolved(theme === 'system' ? (media.matches ? 'dark' : 'light') : theme);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const updateTheme = (next) => {
    setTheme(next);
    try {
      window.localStorage.setItem('theme', next);
    } catch (_) {}
  };

  return (
    <div
      className={`landing-root flex min-h-screen w-full flex-col items-center bg-bg-page text-sm text-primary-text transition-all duration-300 ease-in-out ${
        resolved === 'light' ? 'theme-light' : ''
      }`}
    >
      {announcement}
      <SiteHeader copy={nav} locale={locale} theme={theme} onThemeChange={updateTheme} />
      {children}
    </div>
  );
}
