import { appendBadge, appendTag, type Annotator, type TreeNode } from '@makotot/canopy-core';
import { type Project } from 'ts-morph';

export function createSuspenseAnnotator(
  sourceFilePath: string,
  project: Project,
): Annotator<TreeNode> {
  return (tree) => annotateNode(tree, sourceFilePath, project);
}

function annotateNode(node: TreeNode, sourceFilePath: string, project: Project): TreeNode {
  const isSuspense = isSuspenseBoundary(node.component, sourceFilePath, project);
  const children = node.children.map((child) => annotateNode(child, sourceFilePath, project));
  return {
    ...node,
    ...(isSuspense
      ? {
          meta: {
            ...node.meta,
            ...appendTag(node.meta, 'suspense'),
            ...appendBadge(node.meta, '⏳'),
            style: { fill: '#fef9c3', stroke: '#fde047' },
          },
        }
      : {}),
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

function isSuspenseBoundary(component: string, sourceFilePath: string, project: Project): boolean {
  const sf = project.getSourceFile(sourceFilePath);
  if (!sf) {
    return false;
  }

  if (component === 'Suspense') {
    return sf
      .getImportDeclarations()
      .some(
        (decl) =>
          decl.getModuleSpecifierValue() === 'react' &&
          decl.getNamedImports().some((named) => named.getName() === 'Suspense'),
      );
  }

  if (component === 'React.Suspense') {
    return sf.getImportDeclarations().some((decl) => {
      if (decl.getModuleSpecifierValue() !== 'react') {
        return false;
      }
      const defaultImport = decl.getDefaultImport();
      if (defaultImport?.getText() === 'React') {
        return true;
      }
      const namespaceImport = decl.getNamespaceImport();
      if (namespaceImport?.getText() === 'React') {
        return true;
      }
      return false;
    });
  }

  return false;
}
