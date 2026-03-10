import type { Reporter, TreeNode, Out } from '@makotot/canopy-core';
import { renderMermaid } from './render-mermaid.js';

export { renderMermaid } from './render-mermaid.js';

export function createMermaidReporter(out: Out): Reporter<TreeNode> {
  return (tree) => out(renderMermaid(tree));
}
