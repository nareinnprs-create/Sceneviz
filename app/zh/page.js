import Landing from '@/components/landing/Landing';
import { getCommonCopy } from '@/lib/locales';

const { meta } = getCommonCopy('zh').landing;

export const metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: '/zh',
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
    locale: 'zh_CN',
    url: 'https://sceneviz.opraiz.com/zh',
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

export default function ZhHome() {
  return <Landing locale="zh" />;
}
