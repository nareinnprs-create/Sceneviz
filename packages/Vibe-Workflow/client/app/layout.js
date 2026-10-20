import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vibe Workflow — Node-Based AI Workflow Builder",
  description:
    "Vibe Workflow is a self-hostable node-based AI workflow builder. Build generative AI pipelines with a visual node editor — no subscription required.",
  keywords: [
    "node based ai editor",
    "generative ai pipeline",
    "visual ai workflow",
    "self hosted ai",
    "ai image generation workflow",
    "ai video generation pipeline",
    "no code ai workflow",
    "artistic intelligence",
    "ai workflow automation",
    "vibe workflow",
  ],
  openGraph: {
    title: "Vibe Workflow — Node-Based AI Workflow Builder",
    description:
      "Self-hostable, node-based AI workflow builder. Build generative AI pipelines with a visual node editor.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Workflow — Node-Based AI Workflow Builder",
    description:
      "Self-hostable, node-based AI workflow builder. Build generative AI pipelines with a visual node editor.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
