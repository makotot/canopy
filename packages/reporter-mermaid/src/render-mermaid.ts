import type { TreeNode } from '@makotot/canopy-core';

export function renderMermaid(tree: TreeNode): string {
  const nodeDefs: string[] = [];
  const edgeDefs: string[] = [];
  const styleDefs: string[] = [];
  const counter = { n: 0 };
  const tagKindMap = new Map<string, number>();
  const linkIdMap = new Map<string, string>();
  const pendingCrossLinks: Array<{ sourceId: string; targetId: string; label: string }> = [];

  visit({
    node: tree,
    parentId: null,
    nodeDefs,
    edgeDefs,
    styleDefs,
    counter,
    tagKindMap,
    inGroup: false,
    linkIdMap,
    pendingCrossLinks,
  });

  const crossEdgeDefs = pendingCrossLinks.flatMap(({ sourceId, targetId, label }) => {
    const targetMermaidId = linkIdMap.get(targetId);
    return targetMermaidId ? [`  ${sourceId} -.->|${label}| ${targetMermaidId}`] : [];
  });

  return [`flowchart TD`, ...nodeDefs, ...edgeDefs, ...crossEdgeDefs, ...styleDefs].join('\n');
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
  /** Maps tag kind to palette index, built dynamically on first occurrence. */
  tagKindMap: Map<string, number>;
  /** True when currently inside a subgraph block. Prevents nested subgraphs. */
  inGroup: boolean;
  /** Maps meta.linkId values to Mermaid node IDs for cross-edge resolution. */
  linkIdMap: Map<string, string>;
  /** Accumulated cross-edge pairs to emit after all nodes are visited. */
  pendingCrossLinks: Array<{ sourceId: string; targetId: string; label: string }>;
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
  tagKindMap,
  inGroup,
  linkIdMap,
  pendingCrossLinks,
  indent = '  ',
  propName,
}: VisitOptions): void {
  const group = node.meta?.group as string | undefined;
  const tags = node.meta?.tags as string[] | undefined;
  const style = resolveStyle(tags, tagKindMap);
  const openSubgraph = !!group && !inGroup && node.children.length > 0;
  const id = `n${counter.n++}`;

  const linkId = node.meta?.linkId as string | undefined;
  if (linkId) {
    linkIdMap.set(linkId, id);
  }

  const crossLinks = node.meta?.crossLinks as
    | Array<{ targetId: string; label: string }>
    | undefined;
  if (crossLinks) {
    for (const { targetId, label } of crossLinks) {
      pendingCrossLinks.push({ sourceId: id, targetId, label });
    }
  }

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
        tagKindMap,
        inGroup: true,
        linkIdMap,
        pendingCrossLinks,
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
        tagKindMap,
        inGroup: !!group || inGroup,
        linkIdMap,
        pendingCrossLinks,
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
          tagKindMap,
          inGroup: !!group || inGroup,
          linkIdMap,
          pendingCrossLinks,
          indent,
          propName: name,
        });
      }
    }
  }
}

const PALETTE = [
  { fill: '#dbeafe', stroke: '#93c5fd' },
  { fill: '#d1fae5', stroke: '#6ee7b7' },
  { fill: '#ede9fe', stroke: '#c4b5fd' },
  { fill: '#fef9c3', stroke: '#fde047' },
  { fill: '#f0f9ff', stroke: '#7dd3fc' },
  { fill: '#fed7aa', stroke: '#fb923c' },
  { fill: '#fce7f3', stroke: '#f9a8d4' },
  { fill: '#ccfbf1', stroke: '#5eead4' },
] as const;

/** @internal */
function resolveStyle(
  tags: string[] | undefined,
  tagKindMap: Map<string, number>,
): (typeof PALETTE)[number] | undefined {
  const firstTag = tags?.[0];
  if (!firstTag) {
    return undefined;
  }
  const kind = tagKind(firstTag);
  if (!tagKindMap.has(kind)) {
    tagKindMap.set(kind, tagKindMap.size % PALETTE.length);
  }
  return PALETTE[tagKindMap.get(kind)!];
}

/** @internal */
function buildLabel(node: TreeNode): string {
  const badges = node.meta?.badge as string[] | undefined;
  return badges && badges.length > 0
    ? `${node.component}<br/>${badges.join('<br/>')}`
    : node.component;
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

/** @internal */
function tagKind(tag: string): string {
  const colon = tag.indexOf(':');
  return colon === -1 ? tag : tag.slice(0, colon);
}
