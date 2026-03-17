import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createContextAnnotator } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

// page-with-direct-provider.tsx tree:
//   Page
//     AuthContext.Provider    ← children[0]
//       UserName              ← children[0].children[0]
//
// page-with-wrapper-provider.tsx tree:
//   Page
//     AuthProvider            ← children[0]
//       UserName              ← children[0].children[0]
//
// page-with-direct-consumer.tsx tree:
//   Page
//     AuthProvider            ← children[0]
//       UserMenu              ← children[0].children[0]
//
// page-with-use-consumer.tsx tree:
//   Page
//     AuthProvider            ← children[0]
//       ProfileBadge          ← children[0].children[0]
//
// page-with-custom-hook-consumer.tsx tree:
//   Page
//     AuthProvider            ← children[0]
//       SignOutButton         ← children[0].children[0]
//
// page-with-nested-providers.tsx tree:
//   Page
//     AuthProvider            ← children[0]
//       InnerSection          ← children[0].children[0]
//         AuthContext.Provider ← children[0].children[0].children[0]
//           UserMenu           ← children[0].children[0].children[0].children[0]

describe('createContextAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });

  describe('provider detection', () => {
    it.each([
      {
        label: 'annotates direct <XxxContext.Provider> in JSX',
        fixture: 'page-with-direct-provider.tsx',
        get: (tree: TreeNode) => tree.children[0]?.meta?.['contextBadges'],
        expected: ['provides:AuthContext'],
      },
      {
        label: 'annotates wrapper component that renders Provider internally',
        fixture: 'page-with-wrapper-provider.tsx',
        get: (tree: TreeNode) => tree.children[0]?.meta?.['contextBadges'],
        expected: ['provides:AuthContext'],
      },
    ])('$label', ({ fixture: f, get, expected }) => {
      const { tree, sourceFilePath } = analyzeRenderTree({ filePath: fixture(f), project });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(get(annotator(tree))).toEqual(expected);
    });
  });

  describe('consumer detection', () => {
    it.each([
      {
        label: 'annotates component with direct useContext call',
        fixture: 'page-with-direct-consumer.tsx',
        get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['contextBadges'],
        expected: ['consumes:AuthContext'],
      },
      {
        label: 'annotates component with use() call',
        fixture: 'page-with-use-consumer.tsx',
        get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['contextBadges'],
        expected: ['consumes:AuthContext'],
      },
      {
        label: 'annotates component consuming context via custom hook',
        fixture: 'page-with-custom-hook-consumer.tsx',
        get: (tree: TreeNode) => tree.children[0]?.children[0]?.meta?.['contextBadges'],
        expected: ['consumes:AuthContext'],
      },
    ])('$label', ({ fixture: f, get, expected }) => {
      const { tree, sourceFilePath } = analyzeRenderTree({ filePath: fixture(f), project });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(get(annotator(tree))).toEqual(expected);
    });
  });

  describe('meta fields', () => {
    it('sets meta.badge to first contextBadges entry on provider', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-provider.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(annotator(tree).children[0]?.meta?.['badge']).toBe('provides:AuthContext');
    });

    it('sets green style on provider', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-provider.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(annotator(tree).children[0]?.meta?.['style']).toStrictEqual({
        fill: '#d1fae5',
        stroke: '#6ee7b7',
      });
    });

    it('sets purple style on consumer', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-consumer.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(annotator(tree).children[0]?.children[0]?.meta?.['style']).toStrictEqual({
        fill: '#ede9fe',
        stroke: '#c4b5fd',
      });
    });

    it('sets meta.linkId on consumer nodes', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-consumer.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(annotator(tree).children[0]?.children[0]?.meta?.['linkId']).toMatch(/^ctx-/);
    });

    it('does not set meta.linkId on provider-only nodes', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-provider.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(annotator(tree).children[0]?.meta?.['linkId']).toBeUndefined();
    });

    it('does not annotate components with no context usage', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-provider.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      expect(annotator(tree).children[0]?.children[0]?.meta?.['contextBadges']).toBeUndefined();
    });
  });

  describe('cross-link resolution', () => {
    it('sets crossLinks on provider pointing to nearest consumer', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-direct-consumer.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      const annotated = annotator(tree);
      const provider = annotated.children[0]; // AuthProvider
      const consumer = annotated.children[0]?.children[0]; // UserMenu
      const crossLinks = provider?.meta?.['crossLinks'] as
        | Array<{ targetId: string; label: string }>
        | undefined;
      expect(crossLinks).toHaveLength(1);
      expect(crossLinks?.[0]?.targetId).toBe(consumer?.meta?.['linkId']);
      expect(crossLinks?.[0]?.label).toBe('AuthContext');
    });

    it('nested providers: consumer connects only to nearest ancestor', () => {
      const { tree, sourceFilePath } = analyzeRenderTree({
        filePath: fixture('page-with-nested-providers.tsx'),
        project,
      });
      const annotator = createContextAnnotator(sourceFilePath, project);
      const annotated = annotator(tree);
      const outerProvider = annotated.children[0]; // AuthProvider
      const innerProvider = annotated.children[0]?.children[0]?.children[0]; // AuthContext.Provider
      const consumer = annotated.children[0]?.children[0]?.children[0]?.children[0]; // UserMenu

      // inner provider connects to consumer
      const innerLinks = innerProvider?.meta?.['crossLinks'] as
        | Array<{ targetId: string; label: string }>
        | undefined;
      expect(innerLinks).toHaveLength(1);
      expect(innerLinks?.[0]?.targetId).toBe(consumer?.meta?.['linkId']);

      // outer provider does not connect to consumer
      const outerLinks = outerProvider?.meta?.['crossLinks'] as
        | Array<{ targetId: string; label: string }>
        | undefined;
      expect(outerLinks).toBeUndefined();
    });
  });
});
