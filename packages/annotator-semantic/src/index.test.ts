import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createSemanticAnnotator } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

describe('createSemanticAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });

  describe('landmark elements', () => {
    it.each([
      { element: 'header', badge: 'banner' },
      { element: 'footer', badge: 'contentinfo' },
      { element: 'main', badge: 'main' },
      { element: 'nav', badge: 'navigation' },
      { element: 'aside', badge: 'complementary' },
    ])('annotates $element with badge "$badge"', ({ element, badge }) => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-landmarks.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, element);
      expect(found?.meta?.['badge']).toBe(badge);
    });

    it('annotates article with badge "article"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-landmarks.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'article');
      expect(found?.meta?.['badge']).toBe('article');
    });

    it('annotates a with badge "link"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-landmarks.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'a');
      expect(found?.meta?.['badge']).toBe('link');
    });
  });

  describe('heading elements', () => {
    it.each([
      { element: 'h1', badge: 'heading lv1' },
      { element: 'h2', badge: 'heading lv2' },
      { element: 'h3', badge: 'heading lv3' },
    ])('annotates $element with badge "$badge"', ({ element, badge }) => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-headings.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, element);
      expect(found?.meta?.['badge']).toBe(badge);
    });

    it('annotates section with badge "region"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-headings.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'section');
      expect(found?.meta?.['badge']).toBe('region');
    });
  });

  describe('generic and interactive elements', () => {
    it('annotates div with badge "generic"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'div');
      expect(found?.meta?.['badge']).toBe('generic');
    });

    it('annotates span with badge "generic"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'span');
      expect(found?.meta?.['badge']).toBe('generic');
    });

    it('annotates button with badge "button"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'button');
      expect(found?.meta?.['badge']).toBe('button');
    });

    it('annotates form with badge "form"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'form');
      expect(found?.meta?.['badge']).toBe('form');
    });

    it('annotates input with badge "textbox"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'input');
      expect(found?.meta?.['badge']).toBe('textbox');
    });

    it('annotates select with badge "listbox"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'select');
      expect(found?.meta?.['badge']).toBe('listbox');
    });

    it('annotates textarea with badge "textbox"', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'textarea');
      expect(found?.meta?.['badge']).toBe('textbox');
    });
  });

  describe('unannotated elements', () => {
    it('does not annotate React components', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-landmarks.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      // root is Page component
      expect(annotated.meta?.['badge']).toBeUndefined();
    });
  });

  describe('style', () => {
    it('applies semantic style to landmark elements', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-landmarks.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'header');
      expect(found?.meta?.['style']).toEqual({ fill: '#dcfce7', stroke: '#86efac' });
    });

    it('applies generic style to div', () => {
      const { tree } = analyzeRenderTree({ filePath: fixture('page-with-generic.tsx'), project });
      const annotated = createSemanticAnnotator()(tree);
      const found = findNode(annotated, 'div');
      expect(found?.meta?.['style']).toEqual({ fill: '#f3f4f6', stroke: '#d1d5db' });
    });
  });
});

function findNode(node: TreeNode, component: string): TreeNode | undefined {
  if (node.component === component) return node;
  for (const child of node.children) {
    const found = findNode(child, component);
    if (found) return found;
  }
  if (node.props) {
    for (const slots of Object.values(node.props)) {
      for (const n of slots) {
        const found = findNode(n, component);
        if (found) return found;
      }
    }
  }
  return undefined;
}
