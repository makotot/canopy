import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@makotot/canopy-core';
import { createTreeReporter } from './index.js';

describe('createTreeReporter', () => {
  it('passes renderTree result to out function', () => {
    const lines: string[] = [];
    const tree: TreeNode = { component: 'App', children: [] };
    createTreeReporter((s) => lines.push(s))(tree);
    expect(lines).toEqual(['App']);
  });
});
