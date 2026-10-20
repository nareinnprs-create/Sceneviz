import Landing from '@/components/landing/Landing';
import { getCommonCopy } from '@/lib/locales';

const { meta } = getCommonCopy('en').landing;

export const metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      zh: '/zh',
    },
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    siteName: 'Sceneviz',
    type: 'website',
    locale: 'en_US',
    url: 'https://sceneviz.opraiz.com',
    images: [
      {
        url: 'https://sceneviz.opraiz.com/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: ['https://sceneviz.opraiz.com/opengraph-image.png'],
  },
};

export default function Home() {
  return <Landing locale="en" />;
}
