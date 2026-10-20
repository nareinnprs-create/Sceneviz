import StandaloneShell from '@/components/StandaloneShell';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = ['/studio', ...(slug ?? [])].join('/');
  return {
    title: 'Studio — Sceneviz',
    alternates: {
      canonical: path,
      languages: {
        en: path,
        zh: ['/zh', 'studio', ...(slug ?? [])].join('/'),
      },
    },
  };
}

export default function StudioPage() {
  return <StandaloneShell />;
}
