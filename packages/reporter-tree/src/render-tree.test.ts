import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@makotot/canopy-core';
import { renderTree } from './render-tree.js';

describe('renderTree', () => {
  it.each([
    {
      label: 'single root, no children',
      tree: { component: 'App', children: [] } satisfies TreeNode,
      expected: 'App',
    },
    {
      label: 'root with one child',
      tree: {
        component: 'App',
        children: [{ component: 'Child', children: [] }],
      } satisfies TreeNode,
      expected: 'App\n└── Child',
    },
    {
      label: 'root with multiple children — non-last uses ├──, last uses └──',
      tree: {
        component: 'App',
        children: [
          { component: 'Header', children: [] },
          { component: 'Main', children: [] },
          { component: 'Footer', children: [] },
        ],
      } satisfies TreeNode,
      expected: 'App\n├── Header\n├── Main\n└── Footer',
    },
    {
      label: 'nested children — correct │   continuation vs     termination',
      tree: {
        component: 'App',
        children: [
          {
            component: 'Header',
            children: [{ component: 'Nav', children: [] }],
          },
          {
            component: 'Main',
            children: [
              { component: 'Sidebar', children: [] },
              { component: 'Content', children: [] },
            ],
          },
          { component: 'Footer', children: [] },
        ],
      } satisfies TreeNode,
      expected: [
        'App',
        '├── Header',
        '│   └── Nav',
        '├── Main',
        '│   ├── Sidebar',
        '│   └── Content',
        '└── Footer',
      ].join('\n'),
    },
    {
      label: 'condition=ternary branch=consequent → [? true]',
      tree: {
        component: 'Main',
        children: [
          { component: 'Dashboard', condition: 'ternary', branch: 'consequent', children: [] },
        ],
      } satisfies TreeNode,
      expected: 'Main\n└── Dashboard  [? true]',
    },
    {
      label: 'condition=ternary branch=alternate → [? false]',
      tree: {
        component: 'Main',
        children: [
          { component: 'NotFound', condition: 'ternary', branch: 'alternate', children: [] },
        ],
      } satisfies TreeNode,
      expected: 'Main\n└── NotFound  [? false]',
    },
    {
      label: 'condition=logical → [&&]',
      tree: {
        component: 'Toolbar',
        children: [{ component: 'DeleteButton', condition: 'logical', children: [] }],
      } satisfies TreeNode,
      expected: 'Toolbar\n└── DeleteButton  [&&]',
    },
    {
      label: 'renderProp=true → [renderProp]',
      tree: {
        component: 'Parent',
        children: [{ component: 'Children', renderProp: true, children: [] }],
      } satisfies TreeNode,
      expected: 'Parent\n└── Children  [renderProp]',
    },
    {
      label: 'meta.tags — each rendered as [tag] on the same line',
      tree: {
        component: 'App',
        children: [
          {
            component: 'UserProfile',
            meta: { tags: ['async', 'client'] },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: 'App\n└── UserProfile  [async] [client]',
    },
    {
      label: 'meta.badge — each badge rendered inline',
      tree: {
        component: 'App',
        children: [
          {
            component: 'UserProfile',
            meta: { badge: ['◎', '🔄'] },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: 'App\n└── UserProfile  [◎] [🔄]',
    },
    {
      label: 'multiple tags and badges — all on one line',
      tree: {
        component: 'App',
        children: [
          {
            component: 'UserProfile',
            meta: { tags: ['async', 'client', 'consumes:AuthContext'], badge: ['◎', '🔄'] },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: 'App\n└── UserProfile  [async] [client] [consumes:AuthContext] [◎] [🔄]',
    },
    {
      label: 'props field — [prop: name] pseudo-node with children indented beneath',
      tree: {
        component: 'Layout',
        props: {
          fallback: [{ component: 'Spinner', children: [] }],
        },
        children: [{ component: 'Content', children: [] }],
      } satisfies TreeNode,
      expected: ['Layout', '├── [prop: fallback]', '│   └── Spinner', '└── Content'].join('\n'),
    },
    {
      label: 'meta.group — virtual (group) node wraps children',
      tree: {
        component: 'Dashboard',
        meta: { group: 'client' },
        children: [
          { component: 'DataFetcher', children: [] },
          { component: 'Chart', children: [] },
        ],
      } satisfies TreeNode,
      expected: ['Dashboard', '└── (client)', '    ├── DataFetcher', '    └── Chart'].join('\n'),
    },
    {
      label: 'meta.group with props — props and virtual group node rendered as siblings',
      tree: {
        component: 'Dashboard',
        meta: { group: 'client' },
        props: {
          fallback: [{ component: 'Spinner', children: [] }],
        },
        children: [{ component: 'Chart', children: [] }],
      } satisfies TreeNode,
      expected: [
        'Dashboard',
        '├── [prop: fallback]',
        '│   └── Spinner',
        '└── (client)',
        '    └── Chart',
      ].join('\n'),
    },
    {
      label: 'meta.style — not rendered',
      tree: {
        component: 'App',
        children: [
          {
            component: 'StyledNode',
            meta: { style: { fill: '#dbeafe', stroke: '#93c5fd' } },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: 'App\n└── StyledNode',
    },
    {
      label: 'meta.crossLinks — "Context Links" section appended after tree',
      tree: {
        component: 'App',
        children: [
          {
            component: 'AuthProvider',
            meta: {
              tags: ['provides:AuthContext'],
              crossLinks: [{ targetId: 'ctx-1', label: 'AuthContext' }],
            },
            children: [
              {
                component: 'UserProfile',
                meta: { tags: ['consumes:AuthContext'], linkId: 'ctx-1' },
                children: [],
              },
            ],
          },
          { component: 'Footer', children: [] },
        ],
      } satisfies TreeNode,
      expected: [
        'App',
        '├── AuthProvider  [provides:AuthContext]',
        '│   └── UserProfile  [consumes:AuthContext]',
        '└── Footer',
        '',
        'Context Links',
        '  AuthContext: AuthProvider → UserProfile',
      ].join('\n'),
    },
  ])('$label', ({ tree, expected }) => {
    expect(renderTree(tree)).toBe(expected);
  });
});
