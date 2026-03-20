import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createAsyncAnnotator } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

describe('createAsyncAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });
  it.each([
    {
      label: 'marks async component with "async" in meta.tags',
      fixture: 'page-with-async.tsx',
      get: (tree: TreeNode) =>
        (
          tree.children[0]?.children.find((c) => c.component === 'AsyncData')?.meta?.['tags'] as
            | string[]
            | undefined
        )?.includes('async'),
      expected: true,
    },
    {
      label: 'does not mark sync component',
      fixture: 'page-with-async.tsx',
      get: (tree: TreeNode) =>
        tree.children[0]?.children.find((c) => c.component === 'SyncWidget')?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'does not mark html elements',
      fixture: 'page-with-async.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'annotates async component inside render prop',
      fixture: 'page-with-render-prop.tsx',
      get: (tree: TreeNode) =>
        (
          tree.children[0]?.children[0]?.children.find((c) => c.component === 'AsyncData')?.meta?.[
            'tags'
          ] as string[] | undefined
        )?.includes('async'),
      expected: true,
    },
  ])('$label', ({ fixture: f, get, expected }) => {
    const { tree, sourceFilePath } = analyzeRenderTree({ filePath: fixture(f), project });
    const annotator = createAsyncAnnotator(sourceFilePath, project);
    expect(get(annotator(tree))).toBe(expected);
  });

  it('sets meta.badge to ["⚡"] and meta.tags to ["async"] on async component', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-async.tsx'),
      project,
    });
    const annotator = createAsyncAnnotator(sourceFilePath, project);
    // page-with-async.tsx tree: Page > main > AsyncData (children[0].children[0])
    const meta = annotator(tree).children[0]?.children[0]?.meta;
    expect(meta?.['badge']).toEqual(['↻']);
    expect(meta?.['tags']).toEqual(['async']);
  });
});
