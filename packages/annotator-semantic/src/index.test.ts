import { describe, it, expect, beforeAll } from 'vitest';
import { type Project } from 'ts-morph';
import { analyzeRenderTree, createProject, type TreeNode } from '@makotot/canopy-core';
import { createSemanticAnnotator, requiredAttrs } from './index.js';

const fixture = (name: string) => new URL(`./__fixtures__/${name}`, import.meta.url).pathname;

const GREEN = { fill: '#dcfce7', stroke: '#86efac' };

function analyze(fixtureName: string, project: Project) {
  const { tree } = analyzeRenderTree({
    filePath: fixture(fixtureName),
    project,
    attrsToCollect: requiredAttrs,
  });
  return createSemanticAnnotator()(tree);
}

function findByComponent(tree: TreeNode, component: string): TreeNode | undefined {
  if (tree.component === component) {
    return tree;
  }
  for (const child of tree.children) {
    const found = findByComponent(child, component);
    if (found) {
      return found;
    }
  }
  return undefined;
}

describe('requiredAttrs', () => {
  it('exports role and type', () => {
    expect(requiredAttrs).toContain('role');
    expect(requiredAttrs).toContain('type');
  });
});

describe('createSemanticAnnotator', () => {
  let project: Project;
  beforeAll(() => {
    project = createProject();
  });

  describe('Landmark & Sectioning', () => {
    it.each([
      { component: 'header', badge: 'banner' },
      { component: 'footer', badge: 'contentinfo' },
      { component: 'main', badge: 'main' },
      { component: 'nav', badge: 'navigation' },
      { component: 'aside', badge: 'complementary' },
      { component: 'article', badge: 'article' },
      { component: 'section', badge: 'region' },
      { component: 'search', badge: 'search' },
      { component: 'dialog', badge: 'dialog' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-landmarks.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Heading', () => {
    it.each([
      { component: 'h1', badge: 'heading lv1' },
      { component: 'h2', badge: 'heading lv2' },
      { component: 'h3', badge: 'heading lv3' },
      { component: 'h4', badge: 'heading lv4' },
      { component: 'h5', badge: 'heading lv5' },
      { component: 'h6', badge: 'heading lv6' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-headings.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('List', () => {
    it.each([
      { component: 'ul', badge: 'list' },
      { component: 'ol', badge: 'list' },
      { component: 'menu', badge: 'list' },
      { component: 'li', badge: 'listitem' },
      { component: 'dl', badge: 'list' },
      { component: 'dt', badge: 'term' },
      { component: 'dd', badge: 'definition' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-lists.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Table', () => {
    it.each([
      { component: 'table', badge: 'table' },
      { component: 'caption', badge: 'caption' },
      { component: 'thead', badge: 'rowgroup' },
      { component: 'tbody', badge: 'rowgroup' },
      { component: 'tfoot', badge: 'rowgroup' },
      { component: 'tr', badge: 'row' },
      { component: 'th', badge: 'columnheader' },
      { component: 'td', badge: 'cell' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-table.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Form & Interactive', () => {
    it.each([
      { component: 'form', badge: 'form' },
      { component: 'fieldset', badge: 'group' },
      { component: 'button', badge: 'button' },
      { component: 'select', badge: 'listbox' },
      { component: 'datalist', badge: 'listbox' },
      { component: 'option', badge: 'option' },
      { component: 'optgroup', badge: 'group' },
      { component: 'textarea', badge: 'textbox' },
      { component: 'output', badge: 'status' },
      { component: 'progress', badge: 'progressbar' },
      { component: 'meter', badge: 'meter' },
      { component: 'details', badge: 'group' },
      { component: 'summary', badge: 'button' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-form.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });

    it.each([
      { type: 'text', badge: 'textbox' },
      { type: 'email', badge: 'textbox' },
      { type: 'tel', badge: 'textbox' },
      { type: 'url', badge: 'textbox' },
      { type: 'search', badge: 'searchbox' },
      { type: 'number', badge: 'spinbutton' },
      { type: 'range', badge: 'slider' },
      { type: 'checkbox', badge: 'checkbox' },
      { type: 'radio', badge: 'radio' },
      { type: 'button', badge: 'button' },
      { type: 'submit', badge: 'button' },
      { type: 'reset', badge: 'button' },
      { type: 'image', badge: 'button' },
    ])('input[type=$type] → badge=$badge, green style', ({ type, badge }) => {
      const tree = analyze('page-with-form.tsx', project);
      // find input with matching type
      const input = findInputByType(tree, type);
      expect(input?.meta?.['badge']).toBe(badge);
      expect(input?.meta?.['style']).toEqual(GREEN);
    });

    it('input with no type → badge=textbox, green style', () => {
      const tree = analyze('page-with-form.tsx', project);
      const inputNoType = findInputWithoutType(tree);
      expect(inputNoType?.meta?.['badge']).toBe('textbox');
      expect(inputNoType?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Navigation', () => {
    it('a → badge=link, green style', () => {
      const tree = analyze('page-with-landmarks.tsx', project);
      const node = findByComponent(tree, 'a');
      expect(node?.meta?.['badge']).toBe('link');
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Embedded & Media', () => {
    it.each([
      { component: 'img', badge: 'img' },
      { component: 'figure', badge: 'figure' },
      { component: 'svg', badge: 'img' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-media.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Text-level Semantics', () => {
    it.each([
      { component: 'p', badge: 'paragraph' },
      { component: 'blockquote', badge: 'blockquote' },
      { component: 'hr', badge: 'separator' },
      { component: 'strong', badge: 'strong' },
      { component: 'em', badge: 'emphasis' },
      { component: 'mark', badge: 'mark' },
      { component: 'del', badge: 'deletion' },
      { component: 'ins', badge: 'insertion' },
      { component: 'sub', badge: 'subscript' },
      { component: 'sup', badge: 'superscript' },
      { component: 'code', badge: 'code' },
      { component: 'time', badge: 'time' },
      { component: 'dfn', badge: 'term' },
      { component: 'math', badge: 'math' },
    ])('$component → badge=$badge, green style', ({ component, badge }) => {
      const tree = analyze('page-with-text.tsx', project);
      const node = findByComponent(tree, component);
      expect(node?.meta?.['badge']).toBe(badge);
      expect(node?.meta?.['style']).toEqual(GREEN);
    });
  });

  describe('Generic', () => {
    it('div → badge=generic, no style', () => {
      const tree = analyze('page-with-generic.tsx', project);
      const node = findByComponent(tree, 'div');
      expect(node?.meta?.['badge']).toBe('generic');
      expect(node?.meta?.['style']).toBeUndefined();
    });

    it('span → badge=generic, no style', () => {
      const tree = analyze('page-with-generic.tsx', project);
      const node = findByComponent(tree, 'span');
      expect(node?.meta?.['badge']).toBe('generic');
      expect(node?.meta?.['style']).toBeUndefined();
    });
  });

  describe('Explicit role', () => {
    it('div[role=button] → badge=button, green style', () => {
      const tree = analyze('page-with-explicit-role.tsx', project);
      const node = tree.children[0]?.children[0];
      expect(node?.component).toBe('div');
      expect(node?.meta?.['badge']).toBe('button');
      expect(node?.meta?.['style']).toEqual(GREEN);
    });

    it('span[role=alert] → badge=alert, green style', () => {
      const tree = analyze('page-with-explicit-role.tsx', project);
      const node = tree.children[0]?.children[1];
      expect(node?.component).toBe('span');
      expect(node?.meta?.['badge']).toBe('alert');
      expect(node?.meta?.['style']).toEqual(GREEN);
    });

    it('nav[role=presentation] → badge=presentation, no style', () => {
      const tree = analyze('page-with-explicit-role.tsx', project);
      const node = tree.children[0]?.children[2];
      expect(node?.component).toBe('nav');
      expect(node?.meta?.['badge']).toBe('presentation');
      expect(node?.meta?.['style']).toBeUndefined();
    });

    it('div[role=none] → badge=none, no style', () => {
      const tree = analyze('page-with-explicit-role.tsx', project);
      const node = tree.children[0]?.children[3];
      expect(node?.component).toBe('div');
      expect(node?.meta?.['badge']).toBe('none');
      expect(node?.meta?.['style']).toBeUndefined();
    });
  });

  describe('Non-annotated', () => {
    it('React component node has no badge', () => {
      const tree = analyze('page-with-landmarks.tsx', project);
      expect(tree.meta?.['badge']).toBeUndefined();
    });
  });
});

function findInputByType(tree: TreeNode, type: string): TreeNode | undefined {
  if (tree.component === 'input' && tree.attrs?.['type'] === type) {
    return tree;
  }
  for (const child of tree.children) {
    const found = findInputByType(child, type);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function findInputWithoutType(tree: TreeNode): TreeNode | undefined {
  if (tree.component === 'input' && !tree.attrs?.['type']) {
    return tree;
  }
  for (const child of tree.children) {
    const found = findInputWithoutType(child);
    if (found) {
      return found;
    }
  }
  return undefined;
}
