import { describe, it, expect } from 'vitest';
import type { TreeNode } from '@makotot/canopy-core';
import { createMermaidReporter } from './index.js';

describe('createMermaidReporter', () => {
  it('passes renderMermaid result to out function', () => {
    const lines: string[] = [];
    const tree: TreeNode = { component: 'Page', children: [] };
    createMermaidReporter((s) => lines.push(s))(tree);
    expect(lines).toEqual(['flowchart TD\n  n0["Page"]']);
  });
});
