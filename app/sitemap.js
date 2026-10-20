const BASE = 'https://sceneviz.opraiz.com';

const ROUTES = [
  '/',
  '/studio',
  '/studio/image',
  '/studio/video',
  '/studio/audio',
  '/studio/lipsync',
  '/studio/workflows',
  '/studio/layers',
  '/studio/body-swap',
  '/studio/clipping',
  '/studio/motion-control',
];

function withAlternates(route, priority) {
  const zhRoute = route === '/' ? '/zh' : `/zh${route}`;
  return {
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority,
    alternates: {
      languages: {
        en: `${BASE}${route}`,
        'zh-CN': `${BASE}${zhRoute}`,
      },
    },
  };
}

export default function sitemap() {
  return ROUTES.map((route, index) =>
    withAlternates(route, index === 0 ? 1 : route === '/studio' ? 0.9 : 0.7)
  );
}
