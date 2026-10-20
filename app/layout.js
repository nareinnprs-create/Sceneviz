import './globals.css';
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { headers } from 'next/headers';
import { getLocaleConfig } from '@/lib/locales';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://sceneviz.opraiz.com'),
  title: 'Sceneviz — AI image, video & audio studio · Ideas into moving worlds.',
  description: 'Sceneviz is an all-in-one AI studio for image, video, audio and lip-sync generation. Run 500+ models — FLUX, Seedance, Kling, Veo and more — from one workspace.',
  keywords: ['Sceneviz', 'AI image generator', 'AI video generator', 'AI audio generator', 'AI creative studio', 'text to video', 'image to video', 'AI models'],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      zh: '/zh',
    },
  },
  openGraph: {
    title: 'Sceneviz — AI image, video & audio studio · Ideas into moving worlds.',
    description: 'Sceneviz is an all-in-one AI studio for image, video, audio and lip-sync generation. Run 500+ models — FLUX, Seedance, Kling, Veo and more — from one workspace.',
    siteName: 'Sceneviz',
    type: 'website',
    url: 'https://sceneviz.opraiz.com',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sceneviz — AI image, video & audio studio · Ideas into moving worlds.',
    description: 'Sceneviz is an all-in-one AI studio for image, video, audio and lip-sync generation. Run 500+ models — FLUX, Seedance, Kling, Veo and more — from one workspace.',
    images: ['/opengraph-image.png'],
  },
};

export default async function RootLayout({ children }) {
  // Locale is derived from the URL path by middleware.js and passed
  // through as a plain response header — the root layout is shared by
  // every locale's route tree, so it can't take a `locale` prop directly.
  const headerList = await headers();
  const { htmlLang } = getLocaleConfig(headerList.get('x-locale'));

  return (
    <html lang={htmlLang}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>{children}</body>
    </html>
  );
}
