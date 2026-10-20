export function localizeHref(locale, href) {
  if (!href || !href.startsWith('/')) return href;
  if (!locale || locale === 'en') return href;
  if (href === '/') return `/${locale}`;
  return `/${locale}${href}`;
}
