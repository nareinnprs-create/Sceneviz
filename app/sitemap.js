const BASE = 'https://sceneviz.opraiz.com';

const ROUTES = [
  '/',
  '/agents',
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
  '/studio/cinema',
  '/studio/marketing',
  '/studio/vibe-motion',
  '/studio/agents',
  '/studio/design-agent',
  '/studio/apps',
  '/studio/ai-influencer',
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
  const en = ROUTES.map((route, index) =>
    withAlternates(route, index === 0 ? 1 : route === '/studio' ? 0.9 : 0.7)
  );
  const zh = {
    url: `${BASE}/zh`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
    alternates: {
      languages: {
        en: `${BASE}/`,
        'zh-CN': `${BASE}/zh`,
      },
    },
  };
  return [en[0], zh, ...en.slice(1)];
}
