import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createExternalAnnotator } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

describe('createExternalAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });

  it.each([
    {
      label: 'marks component from exact package match',
      packages: ['lucide-react'],
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'Search')?.meta?.['tags'],
      expected: ['external', 'lucide-react'],
    },
    {
      label: 'marks component from scoped package prefix match',
      packages: ['@radix-ui'],
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'Dialog')?.meta?.['tags'],
      expected: ['external', '@radix-ui'],
    },
    {
      label: 'does not mark project-internal component',
      packages: ['lucide-react', '@radix-ui'],
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'Header')?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'does not mark component from unspecified package',
      packages: ['@radix-ui'],
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'Search')?.meta?.['tags'],
      expected: undefined,
    },
  ])('$label', ({ packages, get, expected }) => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('app-with-external.tsx'),
      project,
    });
    const annotator = createExternalAnnotator(sourceFilePath, project, { packages });
    expect(get(annotator(tree))).toEqual(expected);
  });

  it('sets meta.badge to ["📦"] on matched component', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('app-with-external.tsx'),
      project,
    });
    const annotator = createExternalAnnotator(sourceFilePath, project, {
      packages: ['lucide-react'],
    });
    const meta = annotator(tree).children[0]?.children.find((c) => c.component === 'Search')?.meta;
    expect(meta?.['badge']).toEqual(['📦']);
  });

  it('sets meta.style on matched component', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('app-with-external.tsx'),
      project,
    });
    const annotator = createExternalAnnotator(sourceFilePath, project, {
      packages: ['lucide-react'],
    });
    const meta = annotator(tree).children[0]?.children.find((c) => c.component === 'Search')?.meta;
    expect(meta?.['style']).toEqual({ fill: '#f0f9ff', stroke: '#7dd3fc' });
  });
});
