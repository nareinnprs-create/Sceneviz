/**
 * Flat ESLint config (Next.js 15).
 *
 * `next lint` is deprecated and removed in Next 16, so linting now runs
 * through the ESLint CLI directly (`npm run lint` -> `eslint .`).
 *
 * eslint-config-next@15 still ships the legacy eslintrc format (it patches
 * module resolution via @rushstack/eslint-patch), so we translate the exact
 * `next/core-web-vitals` preset `next lint` used before via FlatCompat.
 * Rule coverage is unchanged: no rules were added, removed, or weakened.
 */
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    // Build output, tool caches, and generated files — never lint sources.
    ignores: [
      'node_modules/**',
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      '.wrangler-dry/**',
      'release/**',
      'out/**',
      '**/dist/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
];
