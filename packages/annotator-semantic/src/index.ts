import { type Annotator, type TreeNode } from '@makotot/canopy-core';

const SEMANTIC_STYLE = { fill: '#dcfce7', stroke: '#86efac' } as const;
const GENERIC_STYLE = { fill: '#f3f4f6', stroke: '#d1d5db' } as const;

const ELEMENT_META: Record<string, { badge: string; style: { fill: string; stroke: string } }> = {
  header: { badge: 'banner', style: SEMANTIC_STYLE },
  footer: { badge: 'contentinfo', style: SEMANTIC_STYLE },
  main: { badge: 'main', style: SEMANTIC_STYLE },
  nav: { badge: 'navigation', style: SEMANTIC_STYLE },
  aside: { badge: 'complementary', style: SEMANTIC_STYLE },
  article: { badge: 'article', style: SEMANTIC_STYLE },
  section: { badge: 'region', style: SEMANTIC_STYLE },
  h1: { badge: 'heading lv1', style: SEMANTIC_STYLE },
  h2: { badge: 'heading lv2', style: SEMANTIC_STYLE },
  h3: { badge: 'heading lv3', style: SEMANTIC_STYLE },
  h4: { badge: 'heading lv4', style: SEMANTIC_STYLE },
  h5: { badge: 'heading lv5', style: SEMANTIC_STYLE },
  h6: { badge: 'heading lv6', style: SEMANTIC_STYLE },
  button: { badge: 'button', style: SEMANTIC_STYLE },
  a: { badge: 'link', style: SEMANTIC_STYLE },
  input: { badge: 'textbox', style: SEMANTIC_STYLE },
  select: { badge: 'listbox', style: SEMANTIC_STYLE },
  textarea: { badge: 'textbox', style: SEMANTIC_STYLE },
  form: { badge: 'form', style: SEMANTIC_STYLE },
  div: { badge: 'generic', style: GENERIC_STYLE },
  span: { badge: 'generic', style: GENERIC_STYLE },
};

export function createSemanticAnnotator(): Annotator<TreeNode> {
  return (tree) => annotateNode(tree);
}

function annotateNode(node: TreeNode): TreeNode {
  const elementMeta = ELEMENT_META[node.component];
  const children = node.children.map(annotateNode);
  return {
    ...node,
    ...(elementMeta ? { meta: { ...node.meta, ...elementMeta } } : {}),
    children,
    ...(node.props
      ? {
          props: Object.fromEntries(
            Object.entries(node.props).map(([k, v]) => [k, v.map(annotateNode)]),
          ),
        }
      : {}),
  };
}
