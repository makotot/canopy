import type { TreeNode } from '@makotot/canopy-core';

export function renderMermaid(tree: TreeNode): string {
  const nodeLines: string[] = [];
  const edgeLines: string[] = [];
  let counter = 0;

  function visit(node: TreeNode, parentId: string | null): void {
    const id = `n${counter++}`;
    nodeLines.push(`  ${id}["${buildLabel(node)}"]`);
    if (parentId !== null) {
      edgeLines.push(`  ${parentId} ${buildEdge(node)} ${id}`);
    }
    for (const child of node.children) {
      visit(child, id);
    }
  }

  visit(tree, null);
  return [`flowchart TD`, ...nodeLines, ...edgeLines].join('\n');
}

function buildLabel(node: TreeNode): string {
  const badge = node.meta?.async ? ' [async]' : '';
  return `${node.component}${badge}`;
}

function buildEdge(node: TreeNode): string {
  if (node.condition === 'ternary' && node.branch === 'consequent') {
    return '-->|? true|';
  }
  if (node.condition === 'ternary' && node.branch === 'alternate') {
    return '-->|? false|';
  }
  if (node.condition === 'logical') {
    return '-->|&&|';
  }
  return '-->';
}
