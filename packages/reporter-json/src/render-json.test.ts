import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@makotot/canopy-core';
import { renderJson } from './render-json.js';

describe('renderJson', () => {
  it.each([
    {
      label: 'root only',
      tree: { component: 'Page', children: [] } satisfies TreeNode,
      expected: JSON.stringify({ component: 'Page', children: [] }, null, 2),
    },
    {
      label: 'parent with one child',
      tree: {
        component: 'Page',
        children: [{ component: 'main', children: [] }],
      } satisfies TreeNode,
      expected: JSON.stringify(
        { component: 'Page', children: [{ component: 'main', children: [] }] },
        null,
        2,
      ),
    },
    {
      label: 'node with meta tags',
      tree: {
        component: 'Page',
        children: [
          {
            component: 'UserList',
            meta: { tags: ['async'], badge: ['↻'] },
            children: [],
          },
        ],
      } satisfies TreeNode,
      expected: JSON.stringify(
        {
          component: 'Page',
          children: [
            {
              component: 'UserList',
              meta: { tags: ['async'], badge: ['↻'] },
              children: [],
            },
          ],
        },
        null,
        2,
      ),
    },
    {
      label: 'node with condition and branch',
      tree: {
        component: 'Page',
        children: [
          { component: 'Dashboard', condition: 'ternary', branch: 'consequent', children: [] },
          { component: 'Login', condition: 'ternary', branch: 'alternate', children: [] },
        ],
      } satisfies TreeNode,
      expected: JSON.stringify(
        {
          component: 'Page',
          children: [
            { component: 'Dashboard', condition: 'ternary', branch: 'consequent', children: [] },
            { component: 'Login', condition: 'ternary', branch: 'alternate', children: [] },
          ],
        },
        null,
        2,
      ),
    },
  ])('$label', ({ tree, expected }) => {
    expect(renderJson(tree)).toBe(expected);
  });
});
