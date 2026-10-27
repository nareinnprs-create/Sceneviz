export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: 'https://sceneviz.opraiz.com/sitemap.xml',
    host: 'https://sceneviz.opraiz.com',
  };
}
