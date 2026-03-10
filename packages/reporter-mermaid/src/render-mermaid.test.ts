import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@makotot/canopy-core';
import { renderMermaid } from './render-mermaid.js';

describe('renderMermaid', () => {
  it.each([
    {
      label: 'root only',
      tree: { component: 'Page', children: [] } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]`,
    },
    {
      label: 'parent with one child',
      tree: {
        component: 'Page',
        children: [{ component: 'main', children: [] }],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["main"]
  n0 --> n1`,
    },
    {
      label: 'async component adds badge',
      tree: {
        component: 'Page',
        children: [{ component: 'AsyncData', meta: { async: true }, children: [] }],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["AsyncData [async]"]
  n0 --> n1`,
    },
    {
      label: 'ternary branch adds edge label',
      tree: {
        component: 'Page',
        children: [
          { component: 'Dashboard', condition: 'ternary', branch: 'consequent', children: [] },
          { component: 'Login', condition: 'ternary', branch: 'alternate', children: [] },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["Dashboard"]
  n2["Login"]
  n0 -->|? true| n1
  n0 -->|? false| n2`,
    },
    {
      label: 'logical branch adds edge label',
      tree: {
        component: 'Page',
        children: [{ component: 'Banner', condition: 'logical', children: [] }],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["Banner"]
  n0 -->|&&| n1`,
    },
  ])('$label', ({ tree, expected }) => {
    expect(renderMermaid(tree)).toBe(expected);
  });
});
