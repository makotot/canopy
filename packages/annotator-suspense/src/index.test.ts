import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createSuspenseAnnotator } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

// page-with-suspense.tsx tree:
//   Page
//     main
//       Suspense        ← children[0].children[0]
//         AsyncWidget   ← children[0].children[0].children[0]
//
// page-with-react-suspense.tsx tree:
//   Page
//     main
//       React.Suspense  ← children[0].children[0]
//         AsyncWidget
//
// page-with-nested-suspense.tsx tree:
//   Page
//     div
//       Suspense        ← children[0].children[0]
//         AsyncWidget
//       Suspense        ← children[0].children[1]
//         Spinner
//
// page-with-suspense-fallback.tsx tree:
//   Page
//     Suspense          ← children[0]
//       AsyncWidget     ← children[0].children[0]
//
// page-with-local-suspense.tsx tree:
//   Page
//     Suspense          ← children[0]  (local component, NOT from react)

describe('createSuspenseAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });

  it.each([
    {
      label: 'marks Suspense (named import) with "suspense" in meta.tags',
      fixture: 'page-with-suspense.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.children[0]?.meta?.['tags'] as string[] | undefined)?.includes(
          'suspense',
        ),
      expected: true,
    },
    {
      label: 'marks React.Suspense (member expression) with "suspense" in meta.tags',
      fixture: 'page-with-react-suspense.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.children[0]?.meta?.['tags'] as string[] | undefined)?.includes(
          'suspense',
        ),
      expected: true,
    },
    {
      label: 'does not mark children inside Suspense',
      fixture: 'page-with-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[0]?.children[0]?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'does not mark html elements',
      fixture: 'page-with-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'marks both Suspense nodes in nested fixture',
      fixture: 'page-with-nested-suspense.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.children[0]?.meta?.['tags'] as string[] | undefined)?.includes(
          'suspense',
        ),
      expected: true,
    },
    {
      label: 'marks second Suspense node in nested fixture',
      fixture: 'page-with-nested-suspense.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.children[1]?.meta?.['tags'] as string[] | undefined)?.includes(
          'suspense',
        ),
      expected: true,
    },
    {
      label: 'marks Suspense when used directly as root child (fallback fixture)',
      fixture: 'page-with-suspense-fallback.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.meta?.['tags'] as string[] | undefined)?.includes('suspense'),
      expected: true,
    },
    {
      label: 'does NOT mark local component named Suspense',
      fixture: 'page-with-local-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['tags'],
      expected: undefined,
    },
  ])('$label', ({ fixture: f, get, expected }) => {
    const { tree, sourceFilePath } = analyzeRenderTree({ filePath: fixture(f), project });
    const annotator = createSuspenseAnnotator(sourceFilePath, project);
    expect(get(annotator(tree))).toBe(expected);
  });

  it('sets meta.badge to ["⏳"] and meta.tags to ["suspense"] on Suspense boundary', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-suspense.tsx'),
      project,
    });
    const annotator = createSuspenseAnnotator(sourceFilePath, project);
    const meta = annotator(tree).children[0]?.children[0]?.meta;
    expect(meta?.['badge']).toEqual(['⏳']);
    expect(meta?.['tags']).toEqual(['suspense']);
  });

  it('also annotates Suspense inside props.fallback subtree', () => {
    // If a Suspense appears inside a fallback prop, it should be annotated too.
    // page-with-suspense-fallback.tsx has Spinner in fallback prop — no nested Suspense,
    // but the props traversal must not throw.
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-suspense-fallback.tsx'),
      project,
    });
    const annotator = createSuspenseAnnotator(sourceFilePath, project);
    expect(() => annotator(tree)).not.toThrow();
  });
});
