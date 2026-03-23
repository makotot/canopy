import { Project, Node, SyntaxKind, type SourceFile } from 'ts-morph';
import { resolveComponent } from '../resolver/resolve-component.js';
import { parseJsxElement, parseSelfClosingElement, parseJsxChildren } from './parse-jsx-element.js';
import type { TreeNode } from './analyze.js';

/** @internal */
export function resolveNode(
  node: TreeNode,
  callerFilePath: string,
  project: Project,
  visited: Set<string>,
  attrsToCollect?: string[],
): TreeNode {
  const resolvedProps = node.props
    ? Object.fromEntries(
        Object.entries(node.props).map(([k, v]) => [
          k,
          v.map((c) => resolveNode(c, callerFilePath, project, visited, attrsToCollect)),
        ]),
      )
    : undefined;

  const withProps = (n: TreeNode) => ({ ...n, ...(resolvedProps ? { props: resolvedProps } : {}) });

  if (!/^[A-Z]/.test(node.component)) {
    const children = node.children.map((c) =>
      resolveNode(c, callerFilePath, project, visited, attrsToCollect),
    );
    return withProps({ ...node, children });
  }

  const funcNode = resolveComponent(node.component, callerFilePath, project);
  if (!funcNode) {
    const children = node.children.map((c) =>
      resolveNode(c, callerFilePath, project, visited, attrsToCollect),
    );
    return withProps({ ...node, children });
  }

  const funcFilePath = funcNode.getSourceFile().getFilePath();
  const visitKey = `${funcFilePath}::${node.component}`;

  if (visited.has(visitKey)) {
    return withProps(node);
  }

  if (node.children.length > 0) {
    const children = node.children.map((c) =>
      resolveNode(c, callerFilePath, project, visited, attrsToCollect),
    );
    return withProps({ ...node, children });
  }

  visited.add(visitKey);
  const internalChildren = extractJsxFromFunc(
    funcNode,
    funcNode.getSourceFile(),
    attrsToCollect,
  ).map((c) => resolveNode(c, funcFilePath, project, visited, attrsToCollect));
  visited.delete(visitKey);

  return withProps({ ...node, children: internalChildren });
}

function extractJsxFromFunc(
  funcNode: Node,
  sourceFile: SourceFile,
  attrsToCollect?: string[],
): TreeNode[] {
  for (const ret of funcNode.getDescendantsOfKind(SyntaxKind.ReturnStatement)) {
    const expr = ret.getExpression();
    if (!expr) {
      continue;
    }
    const target = Node.isParenthesizedExpression(expr) ? expr.getExpression() : expr;
    if (Node.isJsxElement(target)) {
      return [parseJsxElement(target, sourceFile, attrsToCollect)];
    }
    if (Node.isJsxSelfClosingElement(target)) {
      return [parseSelfClosingElement(target, sourceFile, attrsToCollect)];
    }
    if (Node.isJsxFragment(target)) {
      return parseJsxChildren(target.getJsxChildren(), sourceFile, attrsToCollect);
    }
  }
  return [];
}
