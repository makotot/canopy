import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

const cli = new URL('../dist/cli.js', import.meta.url).pathname;
const fixture = (name: string) =>
  new URL(`../../core/src/__fixtures__/${name}`, import.meta.url).pathname;

describe('cli --reporter', () => {
  it('exits with error for unknown reporter', () => {
    expect(() =>
      execSync(`node ${cli} ${fixture('simple-page.tsx')} --reporter unknown`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      }),
    ).toThrow();
  });

  it('outputs JSON with --reporter json', () => {
    const output = execSync(`node ${cli} ${fixture('simple-page.tsx')} --reporter json`, {
      encoding: 'utf-8',
    });
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('component');
    expect(parsed).toHaveProperty('children');
  });
});
