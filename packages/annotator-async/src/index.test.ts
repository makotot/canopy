import { describe, it, expect } from 'vitest';
import { analyzeRenderTree, type TreeNode } from '@makotot/canopy-core';
import { createAsyncAnnotator } from './index.js';

const fixture = (name: string) =>
  new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

describe('createAsyncAnnotator', () => {
  it.each([
    {
      label: 'marks async component with meta.async: true',
      fixture: 'page-with-async.tsx',
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'AsyncData')?.meta?.['async'],
      expected: true,
    },
    {
      label: 'does not mark sync component',
      fixture: 'page-with-async.tsx',
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'SyncWidget')?.meta?.['async'],
      expected: undefined,
    },
    {
      label: 'does not mark html elements',
      fixture: 'page-with-async.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['async'],
      expected: undefined,
    },
    {
      label: 'annotates async component inside render prop',
      fixture: 'page-with-render-prop.tsx',
      get: (tree: TreeNode) =>
        tree.children[0]?.children[0]?.children.find((c) => c.component === 'AsyncData')
          ?.meta?.['async'],
      expected: true,
    },
  ])('$label', ({ fixture: f, get, expected }) => {
    const { tree, project, sourceFilePath } = analyzeRenderTree(fixture(f));
    const annotator = createAsyncAnnotator(sourceFilePath, project);
    expect(get(annotator(tree))).toBe(expected);
  });
});
