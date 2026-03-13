import { resolveComponent, type Annotator, type TreeNode } from '@makotot/canopy-core';
import { Node, type Project } from 'ts-morph';

export function createAsyncAnnotator(
  sourceFilePath: string,
  project: Project,
): Annotator<TreeNode> {
  return (tree) => annotateNode(tree, sourceFilePath, project);
}

function annotateNode(node: TreeNode, sourceFilePath: string, project: Project): TreeNode {
  const isAsync = resolveAndCheckAsync(node.component, sourceFilePath, project);
  const children = node.children.map((child) => annotateNode(child, sourceFilePath, project));
  return {
    ...node,
    ...(isAsync ? { meta: { ...node.meta, async: true, badge: 'async' } } : {}),
    children,
    ...(node.props
      ? {
          props: Object.fromEntries(
            Object.entries(node.props).map(([k, v]) => [
              k,
              v.map((n) => annotateNode(n, sourceFilePath, project)),
            ]),
          ),
        }
      : {}),
  };
}

function resolveAndCheckAsync(
  component: string,
  sourceFilePath: string,
  project: Project,
): boolean {
  const fn = resolveComponent(component, sourceFilePath, project);
  if (!fn) {
    return false;
  }
  if (
    Node.isFunctionDeclaration(fn) ||
    Node.isFunctionExpression(fn) ||
    Node.isArrowFunction(fn)
  ) {
    return fn.isAsync();
  }
  return false;
}
