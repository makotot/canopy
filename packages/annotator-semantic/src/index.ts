import { type Annotator, type TreeNode } from '@makotot/canopy-core';

export const requiredAttrs: string[] = ['role', 'type'];

export function createSemanticAnnotator(): Annotator<TreeNode> {
  return (tree) => annotateNode(tree);
}

const IMPLICIT_ROLE_MAP: Record<string, string> = {
  // Landmark & Sectioning
  header: 'banner',
  footer: 'contentinfo',
  main: 'main',
  nav: 'navigation',
  aside: 'complementary',
  article: 'article',
  section: 'region',
  search: 'search',
  dialog: 'dialog',
  // Heading (h1–h6 handled separately)
  // List
  ul: 'list',
  ol: 'list',
  menu: 'list',
  li: 'listitem',
  dl: 'list',
  dt: 'term',
  dd: 'definition',
  // Table
  table: 'table',
  caption: 'caption',
  thead: 'rowgroup',
  tbody: 'rowgroup',
  tfoot: 'rowgroup',
  tr: 'row',
  th: 'columnheader',
  td: 'cell',
  // Form & Interactive
  form: 'form',
  fieldset: 'group',
  button: 'button',
  select: 'listbox',
  datalist: 'listbox',
  option: 'option',
  optgroup: 'group',
  textarea: 'textbox',
  output: 'status',
  progress: 'progressbar',
  meter: 'meter',
  details: 'group',
  summary: 'button',
  // Navigation
  a: 'link',
  area: 'link',
  // Embedded & Media
  img: 'img',
  figure: 'figure',
  svg: 'img',
  // Text-level Semantics
  p: 'paragraph',
  blockquote: 'blockquote',
  hr: 'separator',
  strong: 'strong',
  em: 'emphasis',
  mark: 'mark',
  del: 'deletion',
  ins: 'insertion',
  sub: 'subscript',
  sup: 'superscript',
  code: 'code',
  time: 'time',
  dfn: 'term',
  math: 'math',
  // Generic
  div: 'generic',
  span: 'generic',
};

const INPUT_TYPE_ROLE_MAP: Record<string, string> = {
  text: 'textbox',
  email: 'textbox',
  tel: 'textbox',
  url: 'textbox',
  search: 'searchbox',
  number: 'spinbutton',
  range: 'slider',
  checkbox: 'checkbox',
  radio: 'radio',
  button: 'button',
  submit: 'button',
  reset: 'button',
  image: 'button',
};

const NO_STYLE_ROLES = new Set(['generic', 'presentation', 'none']);
const GREEN_STYLE = { fill: '#dcfce7', stroke: '#86efac' };

function annotateNode(node: TreeNode): TreeNode {
  const children = node.children.map(annotateNode);
  const props = node.props
    ? Object.fromEntries(Object.entries(node.props).map(([k, v]) => [k, v.map(annotateNode)]))
    : undefined;

  const base = {
    ...node,
    children,
    ...(props ? { props } : {}),
  };

  // Skip React components (uppercase first letter)
  if (/^[A-Z]/.test(node.component)) {
    return base;
  }

  const badge = resolveBadge(node);
  if (badge === undefined) {
    return base;
  }

  const style = NO_STYLE_ROLES.has(badge) ? undefined : GREEN_STYLE;
  return {
    ...base,
    meta: {
      ...node.meta,
      badge,
      ...(style ? { style } : {}),
    },
  };
}

function resolveBadge(node: TreeNode): string | undefined {
  // Explicit role attribute takes precedence
  const explicitRole = node.attrs?.['role'];
  if (explicitRole !== undefined) {
    return explicitRole;
  }

  // Heading elements
  const headingMatch = /^h([1-6])$/.exec(node.component);
  if (headingMatch) {
    return `heading lv${headingMatch[1]}`;
  }

  // input: use type attribute
  if (node.component === 'input') {
    const type = node.attrs?.['type'] ?? 'text';
    return INPUT_TYPE_ROLE_MAP[type];
  }

  return IMPLICIT_ROLE_MAP[node.component];
}
