import { describe, it, expect } from 'vitest';
import { resolveModulePath } from './resolve-module-path.js';

const fixturesDir = new URL('../__fixtures__', import.meta.url).pathname;
const fromFile = `${fixturesDir}/simple-page.tsx`;

describe('resolveModulePath', () => {
  it.each([
    {
      label: 'resolves a relative path with explicit extension',
      specifier: './simple-page.tsx',
      expected: `${fixturesDir}/simple-page.tsx`,
    },
    {
      label: 'resolves a relative path without extension',
      specifier: './simple-page',
      expected: `${fixturesDir}/simple-page.tsx`,
    },
    {
      label: 'resolves a directory to its index.tsx',
      specifier: './button',
      expected: `${fixturesDir}/button/index.tsx`,
    },
  ])('$label', ({ specifier, expected }) => {
    expect(resolveModulePath(specifier, fromFile)).toBe(expected);
  });

  it('returns undefined for a non-existent file', () => {
    expect(resolveModulePath('./nonexistent', fromFile)).toBeUndefined();
  });
});
