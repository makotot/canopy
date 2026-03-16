import type { TreeNode } from '@makotot/canopy-core';

export function renderMermaid(tree: TreeNode): string {
  const nodeDefs: string[] = [];
  const edgeDefs: string[] = [];
  const styleDefs: string[] = [];
  const counter = { n: 0 };

  visit({ node: tree, parentId: null, nodeDefs, edgeDefs, styleDefs, counter, inGroup: false });

  return [`flowchart TD`, ...nodeDefs, ...edgeDefs, ...styleDefs].join('\n');
}

interface VisitOptions {
  node: TreeNode;
  /** ID of the parent node, or null for the root. */
  parentId: string | null;
  /** Accumulated node definition lines (e.g. `n0["Page"]`, `subgraph`, `end`). */
  nodeDefs: string[];
  /** Accumulated edge definition lines (e.g. `n0 --> n1`). Placed after all node defs. */
  edgeDefs: string[];
  /** Accumulated style directive lines (e.g. `style n1 fill:...`). Placed last. */
  styleDefs: string[];
  /** Monotonically incrementing counter shared across the entire traversal. */
  counter: { n: number };
  /** True when currently inside a subgraph block. Prevents nested subgraphs. */
  inGroup: boolean;
  /** Indentation prefix for node definition lines. Increases inside subgraph blocks. */
  indent?: string;
  /** Prop name when this node was passed as a JSX prop (not a child). */
  propName?: string;
}

/** @internal */
function visit({
  node,
  parentId,
  nodeDefs,
  edgeDefs,
  styleDefs,
  counter,
  inGroup,
  indent = '  ',
  propName,
}: VisitOptions): void {
  const group = node.meta?.group as string | undefined;
  const style = node.meta?.style as { fill: string; stroke: string } | undefined;
  const openSubgraph = !!group && !inGroup && node.children.length > 0;
  const id = `n${counter.n++}`;

  if (parentId !== null) {
    edgeDefs.push(`  ${parentId} ${buildEdge(node, propName)} ${id}`);
  }

  nodeDefs.push(`${indent}${id}["${buildLabel(node)}"]`);

  if (style) {
    styleDefs.push(`  style ${id} fill:${style.fill},stroke:${style.stroke}`);
  }

  if (openSubgraph) {
    const sgId = `sg${counter.n++}`;
    nodeDefs.push(`  subgraph ${sgId} ["${group}"]`);
    for (const child of node.children) {
      visit({
        node: child,
        parentId: id,
        nodeDefs,
        edgeDefs,
        styleDefs,
        counter,
        inGroup: true,
        indent: '    ',
      });
    }
    nodeDefs.push(`  end`);
  } else {
    for (const child of node.children) {
      visit({
        node: child,
        parentId: id,
        nodeDefs,
        edgeDefs,
        styleDefs,
        counter,
        inGroup: !!group || inGroup,
        indent,
      });
    }
  }

  if (node.props) {
    for (const [name, propNodes] of Object.entries(node.props)) {
      for (const propNode of propNodes) {
        visit({
          node: propNode,
          parentId: id,
          nodeDefs,
          edgeDefs,
          styleDefs,
          counter,
          inGroup: !!group || inGroup,
          indent,
          propName: name,
        });
      }
    }
  }
}

/** @internal */
function buildLabel(node: TreeNode): string {
  const badge = node.meta?.badge as string | undefined;
  return badge ? `${node.component} [${badge}]` : node.component;
}

/** @internal */
function buildEdge(node: TreeNode, propName?: string): string {
  if (propName) {
    return `-->|${propName}|`;
  }
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
