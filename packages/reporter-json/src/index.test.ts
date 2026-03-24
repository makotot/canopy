import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@makotot/canopy-core';
import { createJsonReporter } from './index.js';

describe('createJsonReporter', () => {
  it('passes renderJson result to out function', () => {
    const lines: string[] = [];
    const tree: TreeNode = { component: 'Page', children: [] };
    createJsonReporter((s) => lines.push(s))(tree);
    expect(lines).toEqual([JSON.stringify({ component: 'Page', children: [] }, null, 2)]);
  });
});
