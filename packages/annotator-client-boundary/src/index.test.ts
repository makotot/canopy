import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createClientBoundaryAnnotator } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

// page-with-client-and-server.tsx tree:
//   Page
//     main
//       ClientWidget   ← children[0].children[0]
//       ServerWidget   ← children[0].children[1]
//
// page-with-transitive-client.tsx tree:
//   Page
//     main
//       ClientImportsShared   ← children[0].children[0]
//         SharedUtil          ← children[0].children[0].children[0]

describe('createClientBoundaryAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });

  it.each([
    {
      label: 'marks ClientWidget (has "use client") with "client" in meta.tags',
      fixture: 'page-with-client-and-server.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.children[0]?.meta?.['tags'] as string[] | undefined)?.includes('client'),
      expected: true,
    },
    {
      label: 'does not mark ServerWidget (no "use client")',
      fixture: 'page-with-client-and-server.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[1]?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'does not mark html element (main)',
      fixture: 'page-with-client-and-server.tsx',
      get: (tree: TreeNode) => tree.children[0]?.meta?.['tags'],
      expected: undefined,
    },
    {
      label: 'marks ClientImportsShared (has "use client") with "client" in meta.tags',
      fixture: 'page-with-transitive-client.tsx',
      get: (tree: TreeNode) =>
        (tree.children[0]?.children[0]?.meta?.['tags'] as string[] | undefined)?.includes('client'),
      expected: true,
    },
    {
      label:
        'marks SharedUtil (transitively imported by a "use client" file) with "client" in meta.tags',
      fixture: 'page-with-transitive-client.tsx',
      get: (tree: TreeNode) =>
        (
          tree.children[0]?.children[0]?.children[0]?.meta?.['tags'] as string[] | undefined
        )?.includes('client'),
      expected: true,
    },
    {
      label: 'sets meta.group to "client" on client component',
      fixture: 'page-with-client-and-server.tsx',
      get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['group'],
      expected: 'client',
    },
  ])('$label', ({ fixture: f, get, expected }) => {
    const { tree, sourceFilePath } = analyzeRenderTree({ filePath: fixture(f), project });
    const annotator = createClientBoundaryAnnotator(sourceFilePath, project);
    expect(get(annotator(tree))).toBe(expected);
  });

  it('sets meta.badge to ["⬡"] and meta.tags to ["client"] on client component', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-client-and-server.tsx'),
      project,
    });
    const annotator = createClientBoundaryAnnotator(sourceFilePath, project);
    const meta = annotator(tree).children[0]?.children[0]?.meta;
    expect(meta?.['badge']).toEqual(['⚡']);
    expect(meta?.['tags']).toEqual(['client']);
  });

  it('sets meta.style with blue fill and stroke on client component', () => {
    const { tree, sourceFilePath } = analyzeRenderTree({
      filePath: fixture('page-with-client-and-server.tsx'),
      project,
    });
    const annotator = createClientBoundaryAnnotator(sourceFilePath, project);
    expect(tree.children[0]?.children[0]?.component).toBe('ClientWidget');
    expect(annotator(tree).children[0]?.children[0]?.meta?.['style']).toStrictEqual({
      fill: '#dbeafe',
      stroke: '#93c5fd',
    });
  });
});
