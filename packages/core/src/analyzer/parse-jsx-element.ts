import { Node, type SourceFile, type JsxElement, type JsxSelfClosingElement } from 'ts-morph';
import { collectJsxFromNode } from './collect-jsx-from-node.js';
import type { TreeNode } from './analyze.js';

/** @internal */
export function parseJsxElement(element: JsxElement, sourceFile: SourceFile): TreeNode {
  return {
    component: getTagName(element),
    children: parseJsxChildren(element.getJsxChildren(), sourceFile),
    ...propsEntry(element, sourceFile),
  };
}

/** @internal */
export function parseSelfClosingElement(element: JsxSelfClosingElement, sourceFile: SourceFile): TreeNode {
  return {
    component: getTagName(element),
    children: [],
    ...propsEntry(element, sourceFile),
  };
}

/** @internal */
export function parseJsxChildren(children: Node[], sourceFile: SourceFile): TreeNode[] {
  return children.flatMap((child) => {
    if (Node.isJsxElement(child)) {
      return [parseJsxElement(child, sourceFile)];
    }
    if (Node.isJsxSelfClosingElement(child)) {
      return [parseSelfClosingElement(child, sourceFile)];
    }
    if (Node.isJsxFragment(child)) {
      return parseJsxChildren(child.getJsxChildren(), sourceFile);
    }
    if (Node.isJsxExpression(child)) {
      const expression = child.getExpression();
      return expression ? collectJsxFromNode(expression, sourceFile) : [];
    }
    return [];
  });
}

function getTagName(element: JsxElement | JsxSelfClosingElement) {
  return Node.isJsxElement(element)
    ? element.getOpeningElement().getTagNameNode().getText()
    : element.getTagNameNode().getText();
}

function extractJsxProps(element: JsxElement | JsxSelfClosingElement, sourceFile: SourceFile) {
  const attributes = Node.isJsxElement(element)
    ? element.getOpeningElement().getAttributes()
    : element.getAttributes();

  const jsxProps: Record<string, TreeNode[]> = {};
  for (const attr of attributes) {
    if (!Node.isJsxAttribute(attr)) {
      continue;
    }
    const initializer = attr.getInitializer();
    if (!initializer || !Node.isJsxExpression(initializer)) {
      continue;
    }
    const expression = initializer.getExpression();
    if (!expression) {
      continue;
    }
    const trees = collectJsxFromNode(expression, sourceFile);
    if (trees.length > 0) {
      jsxProps[attr.getNameNode().getText()] = trees;
    }
  }
  return Object.keys(jsxProps).length > 0 ? jsxProps : undefined;
}

function propsEntry(element: JsxElement | JsxSelfClosingElement, sourceFile: SourceFile) {
  const props = extractJsxProps(element, sourceFile);
  return props ? { props } : {};
}
