export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://sceneviz.opraiz.com/sitemap.xml',
    host: 'https://sceneviz.opraiz.com',
  };
}
