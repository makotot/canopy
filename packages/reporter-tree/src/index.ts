import type { Reporter, TreeNode, Out } from '@makotot/canopy-core';
import { renderTree } from './render-tree.js';

export { renderTree } from './render-tree.js';

export function createTreeReporter(out: Out): Reporter<TreeNode> {
  return (tree) => out(renderTree(tree));
}
