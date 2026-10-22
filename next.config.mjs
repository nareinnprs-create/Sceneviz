import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['studio', 'ai-agent', 'workflow-builder', 'design-agent'],
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    // `unoptimized: true` keeps the build working locally and on Cloudflare
    // Workers without an image loader binding. The `remotePatterns` below
    // document the hosts used by `next/image` inside the workspace packages.
    //
    // Production note: to get real optimization on Workers, replace this with
    // the Cloudflare Images loader (custom `loader` + `loaderFile`) or remove
    // `unoptimized` once an image binding/loader is configured. See DEPLOY.md.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.muapi.ai' },
      { protocol: 'https', hostname: '*.muapi.ai' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
    ],
  },
};

export default nextConfig;
