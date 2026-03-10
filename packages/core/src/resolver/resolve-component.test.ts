import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { resolveComponent } from './resolve-component.js';

const fixturesDir = new URL('../__fixtures__', import.meta.url).pathname;

function createProject(fixturePath: string) {
  const project = new Project({ compilerOptions: { jsx: 4 } });
  project.addSourceFileAtPath(fixturePath);
  return project;
}

describe('resolveComponent', () => {
  it.each([
    {
      label: 'resolves a locally defined component',
      fixture: 'local-component.tsx',
      tagName: 'Header',
      expectDefined: true,
    },
    {
      label: 'returns undefined for an HTML element tag',
      fixture: 'simple-page.tsx',
      tagName: 'main',
      expectDefined: false,
    },
    {
      label: 'returns undefined for an unknown component',
      fixture: 'simple-page.tsx',
      tagName: 'Unknown',
      expectDefined: false,
    },
  ])('$label', ({ fixture, tagName, expectDefined }) => {
    const fixturePath = `${fixturesDir}/${fixture}`;
    const project = createProject(fixturePath);
    const result = resolveComponent(tagName, fixturePath, project);
    expect(result !== undefined).toBe(expectDefined);
  });
});
