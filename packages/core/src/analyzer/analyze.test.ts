import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree } from './analyze.js';
import { createProject } from '../create-project.js';

const fixture = (name: string) => new URL(`../__fixtures__/${name}`, import.meta.url).pathname;

describe('analyzeRenderTree', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });
  describe('root component', () => {
    it.each([
      { fixture: 'simple-page.tsx', expected: 'Page' },
      { fixture: 'page-with-import.tsx', expected: 'Page' },
      { fixture: 'page-with-conditional.tsx', expected: 'Page' },
      { fixture: 'page-with-render-prop.tsx', expected: 'Page' },
    ])('$fixture → $expected', ({ fixture: f, expected }) => {
      const result = analyzeRenderTree(fixture(f), project);
      expect(result.tree.component).toBe(expected);
    });
  });

  describe('tree expansion', () => {
    it.each([
      {
        label: 'expands imported component recursively',
        fixture: 'page-with-import.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children[0]?.children[0]?.component,
        expected: 'h1',
      },
      {
        label: 'ternary consequent branch',
        fixture: 'page-with-conditional.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children.find((c) => c.component === 'Dashboard')?.component,
        expected: 'Dashboard',
      },
      {
        label: 'ternary alternate branch',
        fixture: 'page-with-conditional.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children.find((c) => c.component === 'Login')?.component,
        expected: 'Login',
      },
      {
        label: 'logical && branch',
        fixture: 'page-with-conditional.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children.find((c) => c.component === 'Banner')?.component,
        expected: 'Banner',
      },
      {
        label: 'render prop captured in props',
        fixture: 'page-with-render-prop.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.props?.['fallback']?.[0]?.component,
        expected: 'Loading',
      },
      {
        label: 'named import component expanded',
        fixture: 'page-with-named-import.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children[0]?.children[0]?.component,
        expected: 'h1',
      },
      {
        label: 'logical || right branch',
        fixture: 'page-with-or-operator.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children.find((c) => c.component === 'Fallback')?.component,
        expected: 'Fallback',
      },
      {
        label: 'map callback renders list item',
        fixture: 'page-with-list.tsx',
        get: (tree: ReturnType<typeof analyzeRenderTree>['tree']) =>
          tree.children[0]?.children[0]?.children[0]?.component,
        expected: 'li',
      },
    ])('$label', ({ fixture: f, get, expected }) => {
      const result = analyzeRenderTree(fixture(f), project);
      expect(get(result.tree)).toBe(expected);
    });
  });

  describe('error handling', () => {
    it.each([
      { label: 'non-existent file', path: '/nonexistent/page.tsx', error: 'File not found' },
    ])('$label', ({ path, error }) => {
      expect(() => analyzeRenderTree(path)).toThrow(error);
    });
  });
});
