import { getCommonCopy } from '@/lib/locales';
import AnnouncementBar from './AnnouncementBar';
import ThemeShell from './ThemeShell';
import Hero from './Hero';
import ClaimsStrip from './ClaimsStrip';
import StatsBand from './StatsBand';
import ProvidersSection from './ProvidersSection';
import ToolsSection from './ToolsSection';
import ModelsSection from './ModelsSection';
import ApiSection from './ApiSection';
import FeaturesSection from './FeaturesSection';
import SiteFooter from './SiteFooter';

export default function Landing({ locale = 'en' }) {
  const copy = getCommonCopy(locale).landing;

  return (
    <ThemeShell
      locale={locale}
      nav={copy.nav}
      announcement={<AnnouncementBar copy={copy.announcement} locale={locale} />}
    >
      <main className="flex w-full flex-col items-center">
        <Hero copy={copy.hero} locale={locale} />
        <ClaimsStrip copy={copy.claims} />
        <StatsBand copy={copy.statsBand} />
        <ProvidersSection copy={copy.providers} locale={locale} />
        <ToolsSection copy={copy.tools} locale={locale} />
        <ModelsSection copy={copy.models} locale={locale} />
        <ApiSection copy={copy.apiSection} locale={locale} />
        <FeaturesSection copy={copy.features} locale={locale} />
      </main>
      <SiteFooter copy={copy.footer} locale={locale} />
    </ThemeShell>
  );
}
