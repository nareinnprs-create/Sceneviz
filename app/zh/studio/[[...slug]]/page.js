import StandaloneShell from '@/components/StandaloneShell';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = ['/zh', 'studio', ...(slug ?? [])].join('/');
  return {
    title: 'Studio — Sceneviz',
    alternates: {
      canonical: path,
      languages: {
        en: ['/studio', ...(slug ?? [])].join('/'),
        zh: path,
      },
    },
  };
}

// Additive locale route wrapper: reuses the exact same shell component as
// app/studio/[[...slug]]/page.js, only passing `locale="zh"`. A future
// locale repeats this file under app/<locale>/studio/[[...slug]]/page.js.
export default function ZhStudioPage() {
  return <StandaloneShell locale="zh" />;
}
