import type { TreeNode } from '@makotot/canopy-core';

export function renderTree(tree: TreeNode): string {
  const lines: string[] = [];
  renderNode(tree, null, true, lines);

  const crossLinks = collectCrossLinks(tree);
  if (crossLinks.length > 0) {
    lines.push('');
    lines.push('Context Links');
    for (const { label, providerComponent, consumerComponent } of crossLinks) {
      lines.push(`  ${label}: ${providerComponent} → ${consumerComponent}`);
    }
  }

  return lines.join('\n');
}

type PropItem = { kind: 'prop'; name: string; nodes: TreeNode[] };
type GroupItem = { kind: 'group'; name: string; children: TreeNode[] };
type NodeItem = { kind: 'node'; node: TreeNode };
type Item = PropItem | GroupItem | NodeItem;

/**
 * @param prefix - null for the root node (no connector emitted); a string prefix for all other nodes.
 * @internal
 */
function renderNode(node: TreeNode, prefix: string | null, isLast: boolean, lines: string[]): void {
  if (prefix === null) {
    lines.push(labelOf(node));
  } else {
    const connector = isLast ? '└── ' : '├── ';
    lines.push(prefix + connector + labelOf(node));
  }

  const childPrefix = prefix === null ? '' : prefix + (isLast ? '    ' : '│   ');
  const group = node.meta?.group as string | undefined;
  const propItems: PropItem[] = Object.entries(node.props ?? {}).map(([name, nodes]) => ({
    kind: 'prop',
    name,
    nodes,
  }));

  const allItems: Item[] =
    group && node.children.length > 0
      ? [...propItems, { kind: 'group', name: group, children: node.children }]
      : [...propItems, ...node.children.map((n): NodeItem => ({ kind: 'node', node: n }))];

  for (const [i, item] of allItems.entries()) {
    const isLastItem = i === allItems.length - 1;
    const itemConnector = isLastItem ? '└── ' : '├── ';
    const itemContinuation = isLastItem ? '    ' : '│   ';

    if (item.kind === 'prop') {
      lines.push(childPrefix + itemConnector + `[prop: ${item.name}]`);
      const propPrefix = childPrefix + itemContinuation;
      for (const [j, propNode] of item.nodes.entries()) {
        renderNode(propNode, propPrefix, j === item.nodes.length - 1, lines);
      }
    } else if (item.kind === 'group') {
      lines.push(childPrefix + itemConnector + `(${item.name})`);
      const groupPrefix = childPrefix + itemContinuation;
      for (const [j, child] of item.children.entries()) {
        renderNode(child, groupPrefix, j === item.children.length - 1, lines);
      }
    } else {
      renderNode(item.node, childPrefix, isLastItem, lines);
    }
  }
}

/** @internal */
function labelOf(node: TreeNode): string {
  const annotations: string[] = [];

  if (node.condition === 'ternary' && node.branch === 'consequent') {
    annotations.push('[? true]');
  } else if (node.condition === 'ternary' && node.branch === 'alternate') {
    annotations.push('[? false]');
  } else if (node.condition === 'logical') {
    annotations.push('[&&]');
  }

  if (node.renderProp) {
    annotations.push('[renderProp]');
  }

  const tags = node.meta?.tags as string[] | undefined;
  if (tags) {
    for (const tag of tags) {
      annotations.push(`[${tag}]`);
    }
  }

  const badges = node.meta?.badge as string[] | undefined;
  if (badges) {
    for (const badge of badges) {
      annotations.push(`[${badge}]`);
    }
  }

  return annotations.length > 0 ? `${node.component}  ${annotations.join(' ')}` : node.component;
}

interface CrossLinkEntry {
  label: string;
  providerComponent: string;
  consumerComponent: string;
}

/** @internal */
function collectCrossLinks(tree: TreeNode): CrossLinkEntry[] {
  const linkIdMap = new Map<string, string>();
  buildLinkIdMap(tree, linkIdMap);

  const result: CrossLinkEntry[] = [];
  gatherCrossLinks(tree, linkIdMap, result);
  return result;
}

/** @internal */
function buildLinkIdMap(node: TreeNode, map: Map<string, string>): void {
  const linkId = node.meta?.linkId as string | undefined;
  if (linkId) {
    map.set(linkId, node.component);
  }
  for (const child of node.children) {
    buildLinkIdMap(child, map);
  }
  if (node.props) {
    for (const propNodes of Object.values(node.props)) {
      for (const propNode of propNodes) {
        buildLinkIdMap(propNode, map);
      }
    }
  }
}

/** @internal */
function gatherCrossLinks(
  node: TreeNode,
  linkIdMap: Map<string, string>,
  result: CrossLinkEntry[],
): void {
  const crossLinks = node.meta?.crossLinks as
    | Array<{ targetId: string; label: string }>
    | undefined;
  if (crossLinks) {
    for (const { targetId, label } of crossLinks) {
      const consumerComponent = linkIdMap.get(targetId);
      if (consumerComponent) {
        result.push({ label, providerComponent: node.component, consumerComponent });
      }
    }
  }
  for (const child of node.children) {
    gatherCrossLinks(child, linkIdMap, result);
  }
  if (node.props) {
    for (const propNodes of Object.values(node.props)) {
      for (const propNode of propNodes) {
        gatherCrossLinks(propNode, linkIdMap, result);
      }
    }
  }
}
