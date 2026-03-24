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
      label: 'meta.badge renders as <br/> separated lines below component name',
      tree: {
        component: 'Page',
        children: [{ component: 'AsyncData', meta: { badge: ['↻'] }, children: [] }],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["AsyncData<br/>↻"]
  n0 --> n1`,
    },
    {
      label: 'multiple badges in meta.badge render as separate lines',
      tree: {
        component: 'Page',
        children: [{ component: 'AsyncProvider', meta: { badge: ['↻', '◎'] }, children: [] }],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["AsyncProvider<br/>↻<br/>◎"]
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
      label: 'tagged node gets first palette color',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'ClientWidget',
            meta: { badge: ['⚡'], tags: ['client'] },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget<br/>⚡"]
  n0 --> n1
  style n1 fill:#dbeafe,stroke:#93c5fd`,
    },
    {
      label: 'second tagged node gets second palette color',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'ClientWidget',
            meta: { tags: ['client'] },
            children: [{ component: 'AsyncData', meta: { tags: ['async'] }, children: [] }],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget"]
  n2["AsyncData"]
  n0 --> n1
  n1 --> n2
  style n1 fill:#dbeafe,stroke:#93c5fd
  style n2 fill:#d1fae5,stroke:#6ee7b7`,
    },
    {
      label: 'same tag kind always gets the same palette color',
      tree: {
        component: 'Page',
        children: [
          { component: 'A', meta: { tags: ['client'] }, children: [] },
          { component: 'B', meta: { tags: ['async'] }, children: [] },
          { component: 'C', meta: { tags: ['client'] }, children: [] },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["A"]
  n2["B"]
  n3["C"]
  n0 --> n1
  n0 --> n2
  n0 --> n3
  style n1 fill:#dbeafe,stroke:#93c5fd
  style n2 fill:#d1fae5,stroke:#6ee7b7
  style n3 fill:#dbeafe,stroke:#93c5fd`,
    },
    {
      label: 'colon-prefixed tags are grouped by prefix for color assignment',
      tree: {
        component: 'Page',
        children: [
          { component: 'A', meta: { tags: ['provides:Foo'] }, children: [] },
          { component: 'B', meta: { tags: ['provides:Bar'] }, children: [] },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["A"]
  n2["B"]
  n0 --> n1
  n0 --> n2
  style n1 fill:#dbeafe,stroke:#93c5fd
  style n2 fill:#dbeafe,stroke:#93c5fd`,
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
              badge: ['⚡'],
              group: 'client',
              tags: ['client'],
            },
            children: [{ component: 'button', children: [] }],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget<br/>⚡"]
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
              badge: ['⚡'],
              group: 'client',
              tags: ['client'],
            },
            children: [
              {
                component: 'InnerClient',
                meta: {
                  badge: ['⚡'],
                  group: 'client',
                  tags: ['client'],
                },
                children: [{ component: 'span', children: [] }],
              },
            ],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["ClientWidget<br/>⚡"]
  subgraph sg2 ["client"]
    n3["InnerClient<br/>⚡"]
    n4["span"]
  end
  n0 --> n1
  n1 --> n3
  n3 --> n4
  style n1 fill:#dbeafe,stroke:#93c5fd
  style n3 fill:#dbeafe,stroke:#93c5fd`,
    },
    {
      label: 'meta.crossLinks emits dashed edge from provider to consumer',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'AuthProvider',
            meta: {
              badge: ['◎'],
              tags: ['provides:AuthContext'],
              crossLinks: [{ targetId: 'ctx-0', label: 'AuthContext' }],
            },
            children: [
              {
                component: 'UserMenu',
                meta: {
                  badge: ['◎'],
                  tags: ['consumes:AuthContext'],
                  linkId: 'ctx-0',
                },
                children: [],
              },
            ],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["AuthProvider<br/>◎"]
  n2["UserMenu<br/>◎"]
  n0 --> n1
  n1 --> n2
  n1 -.->|AuthContext| n2
  style n1 fill:#dbeafe,stroke:#93c5fd
  style n2 fill:#d1fae5,stroke:#6ee7b7`,
    },
    {
      label: 'meta.crossLinks with no matching linkId emits nothing',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'AuthProvider',
            meta: {
              crossLinks: [{ targetId: 'ctx-missing', label: 'AuthContext' }],
            },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["AuthProvider"]
  n0 --> n1`,
    },
    {
      label: 'multiple consumers each get a cross-edge from the provider',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'AuthProvider',
            meta: {
              crossLinks: [
                { targetId: 'ctx-0', label: 'AuthContext' },
                { targetId: 'ctx-1', label: 'AuthContext' },
              ],
            },
            children: [
              {
                component: 'UserMenu',
                meta: { linkId: 'ctx-0' },
                children: [],
              },
              {
                component: 'ProfileBadge',
                meta: { linkId: 'ctx-1' },
                children: [],
              },
            ],
          },
        ],
      } satisfies TreeNode,
      expected: `flowchart TD
  n0["Page"]
  n1["AuthProvider"]
  n2["UserMenu"]
  n3["ProfileBadge"]
  n0 --> n1
  n1 --> n2
  n1 --> n3
  n1 -.->|AuthContext| n2
  n1 -.->|AuthContext| n3`,
    },
  ])('$label', ({ tree, expected }) => {
    expect(renderMermaid(tree)).toBe(expected);
  });
});
