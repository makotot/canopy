import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      '@makotot/canopy-core': fileURLToPath(
        new URL('./packages/core/src/index.ts', import.meta.url),
      ),
      '@makotot/canopy-annotator-async': fileURLToPath(
        new URL('./packages/annotator-async/src/index.ts', import.meta.url),
      ),
      '@makotot/canopy-annotator-client-boundary': fileURLToPath(
        new URL('./packages/annotator-client-boundary/src/index.ts', import.meta.url),
      ),
      '@makotot/canopy-reporter-mermaid': fileURLToPath(
        new URL('./packages/reporter-mermaid/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.test.ts', 'packages/*/src/**/__fixtures__/**'],
    },
  },
});
