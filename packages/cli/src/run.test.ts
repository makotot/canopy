import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { createProject } from '@makotot/canopy-core';
import { run } from './run.js';

const fixture = (name: string) =>
  new URL(`../../core/src/__fixtures__/${name}`, import.meta.url).pathname;

describe('run', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });
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
    run(fixture(f), (s) => { output = s; }, project);
    assert(output);
  });

  it('outputs named export component when componentName is specified', () => {
    let output = '';
    run(fixture('named-export-component.tsx'), (s) => { output = s; }, project, 'Header');
    expect(output).toContain('Header');
  });

  it('auto-detects named export when no default export', () => {
    let output = '';
    run(fixture('named-export-component.tsx'), (s) => { output = s; }, project);
    expect(output).toContain('Header');
  });

  it('throws for non-existent file', () => {
    expect(() => run('/nonexistent/page.tsx', () => {})).toThrow('File not found');
  });
});
