import type { Reporter, TreeNode, Out } from '@makotot/canopy-core';
import { renderJson } from './render-json.js';

export { renderJson } from './render-json.js';

export function createJsonReporter(out: Out): Reporter<TreeNode> {
  return (tree) => out(renderJson(tree));
}
