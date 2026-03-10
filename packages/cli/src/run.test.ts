import { describe, it, expect } from 'vitest';
import { run } from './run.js';

const fixture = (name: string) =>
  new URL(`../../core/src/__fixtures__/${name}`, import.meta.url).pathname;

describe('run', () => {
  it.each([
    {
      label: 'outputs mermaid flowchart header',
      fixture: 'simple-page.tsx',
      assert: (output: string) => {
        expect(output).toContain('flowchart TD');
      },
    },
    {
      label: 'includes root component name in output',
      fixture: 'simple-page.tsx',
      assert: (output: string) => {
        expect(output).toContain('Page');
      },
    },
    {
      label: 'outputs valid mermaid for page with imports',
      fixture: 'page-with-import.tsx',
      assert: (output: string) => {
        expect(output).toContain('flowchart TD');
        expect(output).toContain('Page');
      },
    },
  ])('$label', ({ fixture: f, assert }) => {
    let output = '';
    run(fixture(f), (s) => { output = s; });
    assert(output);
  });

  it('throws for non-existent file', () => {
    expect(() => run('/nonexistent/page.tsx', () => {})).toThrow('File not found');
  });
});
