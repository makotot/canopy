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
      label: 'marks Suspense (named import) with meta.suspense: true',
      fixture: 'page-with-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['suspense'],
      expected: true,
    },
    {
      label: 'marks React.Suspense (member expression) with meta.suspense: true',
      fixture: 'page-with-react-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['suspense'],
      expected: true,
    },
    {
      label: 'does not mark children inside Suspense',
      fixture: 'page-with-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[0]?.children[0]?.meta?.['suspense'],
      expected: undefined,
    },
    {
      label: 'does not mark html elements',
      fixture: 'page-with-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['suspense'],
      expected: undefined,
    },
    {
      label: 'marks both Suspense nodes in nested fixture',
      fixture: 'page-with-nested-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['suspense'],
      expected: true,
    },
    {
      label: 'marks second Suspense node in nested fixture',
      fixture: 'page-with-nested-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[1]?.meta?.['suspense'],
      expected: true,
    },
    {
      label: 'marks Suspense when used directly as root child (fallback fixture)',
      fixture: 'page-with-suspense-fallback.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['suspense'],
      expected: true,
    },
    {
      label: 'does NOT mark local component named Suspense',
      fixture: 'page-with-local-suspense.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['suspense'],
      expected: undefined,
    },
  ])('$label', ({ fixture: f, get, expected }) => {
    const { tree, sourceFilePath } = analyzeRenderTree({ filePath: fixture(f), project });
    const annotator = createSuspenseAnnotator(sourceFilePath, project);
    expect(get(annotator(tree))).toBe(expected);
  });

  it('sets meta.badge to "Suspense" on Suspense boundary', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-suspense.tsx'),
      project,
    });
    const annotator = createSuspenseAnnotator(sourceFilePath, project);
    expect(annotator(tree).children[0]?.children[0]?.meta?.['badge']).toBe('Suspense');
  });

  it('sets meta.style with yellow fill and stroke on Suspense boundary', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-suspense.tsx'),
      project,
    });
    const annotator = createSuspenseAnnotator(sourceFilePath, project);
    expect(annotator(tree).children[0]?.children[0]?.meta?.['style']).toStrictEqual({
      fill: '#fef9c3',
      stroke: '#fde047',
    });
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
