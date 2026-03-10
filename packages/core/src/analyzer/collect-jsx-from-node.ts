import { Node, SyntaxKind, type SourceFile } from 'ts-morph';
import { parseJsxElement, parseSelfClosingElement, parseJsxChildren } from './parse-jsx-element.js';
import type { TreeNode } from './analyze.js';

/** @internal */
export function collectJsxFromNode(node: Node, sourceFile: SourceFile): TreeNode[] {
  if (Node.isJsxElement(node)) {
    return [parseJsxElement(node, sourceFile)];
  }
  if (Node.isJsxSelfClosingElement(node)) {
    return [parseSelfClosingElement(node, sourceFile)];
  }
  if (Node.isJsxFragment(node)) {
    return parseJsxChildren(node.getJsxChildren(), sourceFile);
  }
  if (Node.isConditionalExpression(node)) {
    return [
      ...withAnnotation(collectJsxFromNode(node.getWhenTrue(), sourceFile), { condition: 'ternary', branch: 'consequent' }),
      ...withAnnotation(collectJsxFromNode(node.getWhenFalse(), sourceFile), { condition: 'ternary', branch: 'alternate' }),
    ];
  }
  if (Node.isBinaryExpression(node)) {
    const op = node.getOperatorToken().getText();
    if (op === '&&') {
      return withAnnotation(collectJsxFromNode(node.getRight(), sourceFile), { condition: 'logical' });
    }
    if (op === '||' || op === '??') {
      return [
        ...collectJsxFromNode(node.getLeft(), sourceFile),
        ...collectJsxFromNode(node.getRight(), sourceFile),
      ];
    }
  }
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    return withAnnotation(collectJsxFromNode(node.getBody(), sourceFile), { renderProp: true });
  }
  if (Node.isBlock(node)) {
    return node.getDescendantsOfKind(SyntaxKind.ReturnStatement).flatMap((ret) => {
      const expr = ret.getExpression();
      return expr ? collectJsxFromNode(expr, sourceFile) : [];
    });
  }
  if (Node.isParenthesizedExpression(node)) {
    return collectJsxFromNode(node.getExpression(), sourceFile);
  }
  if (Node.isCallExpression(node)) {
    const callbackArgs = node
      .getArguments()
      .filter((arg) => Node.isArrowFunction(arg) || Node.isFunctionExpression(arg));
    if (callbackArgs.length > 0) {
      return callbackArgs.flatMap((arg) =>
        Node.isArrowFunction(arg) || Node.isFunctionExpression(arg)
          ? collectJsxFromNode(arg.getBody(), sourceFile)
          : [],
      );
    }
  }
  return collectJsxFromDescendants(node, sourceFile);
}

function collectJsxFromDescendants(node: Node, sourceFile: SourceFile): TreeNode[] {
  return [
    ...node.getDescendantsOfKind(SyntaxKind.JsxElement).map((child) => parseJsxElement(child, sourceFile)),
    ...node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).map((child) => parseSelfClosingElement(child, sourceFile)),
  ];
}

function withAnnotation(nodes: TreeNode[], annotation: Partial<TreeNode>): TreeNode[] {
  return nodes.map((n) => ({ ...n, ...annotation }));
}
