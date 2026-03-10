import { Node } from 'ts-morph';

/** @internal */
export function isFunctionLike(node: Node) {
  return (
    Node.isFunctionDeclaration(node) ||
    Node.isFunctionExpression(node) ||
    Node.isArrowFunction(node)
  );
}
