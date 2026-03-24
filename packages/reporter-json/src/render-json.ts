import type { TreeNode } from '@makotot/canopy-core';

export function renderJson(tree: TreeNode): string {
  return JSON.stringify(tree, null, 2);
}
