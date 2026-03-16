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
      label: 'meta.badge renders as label suffix',
      tree: {
        component: 'Page',
        children: [{ component: 'AsyncData', meta: { badge: 'async' }, children: [] }],
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
    {
      label: 'meta.style applies style directive',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'ClientWidget',
            meta: { badge: 'client', style: { fill: '#dbeafe', stroke: '#93c5fd' } },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget [client]"]
  n0 --> n1
  style n1 fill:#dbeafe,stroke:#93c5fd`,
    },
    {
      label: 'props with JSX nodes render as labeled edges',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'Suspense',
            children: [{ component: 'Content', children: [] }],
            props: {
              fallback: [{ component: 'Loading', children: [] }],
            },
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["Suspense"]
  n2["Content"]
  n3["Loading"]
  n0 --> n1
  n1 --> n2
  n1 -->|fallback| n3`,
    },
    {
      label: 'meta.group with children wraps subtree in subgraph',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'ClientWidget',
            meta: {
              badge: 'client',
              group: 'client',
              style: { fill: '#dbeafe', stroke: '#93c5fd' },
            },
            children: [{ component: 'button', children: [] }],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget [client]"]
  subgraph sg2 ["client"]
    n3["button"]
  end
  n0 --> n1
  n1 --> n3
  style n1 fill:#dbeafe,stroke:#93c5fd`,
    },
    {
      label: 'components already inside a group subgraph are not re-wrapped',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'ClientWidget',
            meta: {
              badge: 'client',
              group: 'client',
              style: { fill: '#dbeafe', stroke: '#93c5fd' },
            },
            children: [
              {
                component: 'InnerClient',
                meta: {
                  badge: 'client',
                  group: 'client',
                  style: { fill: '#dbeafe', stroke: '#93c5fd' },
                },
                children: [{ component: 'span', children: [] }],
              },
            ],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget [client]"]
  subgraph sg2 ["client"]
    n3["InnerClient [client]"]
    n4["span"]
  end
  n0 --> n1
  n1 --> n3
  n3 --> n4
  style n1 fill:#dbeafe,stroke:#93c5fd
  style n3 fill:#dbeafe,stroke:#93c5fd`,
    },
  ])('$label', ({ tree, expected }) => {
    expect(renderMermaid(tree)).toBe(expected);
  });
});
