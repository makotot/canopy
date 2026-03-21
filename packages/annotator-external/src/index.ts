import {
  appendBadge,
  appendTag,
  resolveModulePath,
  type Annotator,
  type TreeNode,
} from '@makotot/canopy-core';
import { type Project } from 'ts-morph';

export interface ExternalAnnotatorOptions {
  packages: string[];
}

export function createExternalAnnotator(
  sourceFilePath: string,
  project: Project,
  options: ExternalAnnotatorOptions,
): Annotator<TreeNode> {
  return (tree) => annotateNode(tree, sourceFilePath, project, options);
}

function annotateNode(
  node: TreeNode,
  currentFilePath: string,
  project: Project,
  options: ExternalAnnotatorOptions,
): TreeNode {
  const specifier = getImportSpecifier(node.component, currentFilePath, project);
  const resolvedPath =
    specifier !== undefined ? resolveModulePath(specifier, currentFilePath) : undefined;
  const isInternal = resolvedPath !== undefined;
  const matchedPkg =
    specifier !== undefined && !isInternal && !specifier.includes(':')
      ? matchPackage(specifier, options.packages)
      : undefined;
  const childFilePath = isInternal ? resolvedPath : currentFilePath;
  const recurse = (n: TreeNode) => annotateNode(n, childFilePath, project, options);

  return {
    ...node,
    ...(matchedPkg !== undefined ? { meta: buildExternalMeta(node.meta, matchedPkg) } : {}),
    children: node.children.map(recurse),
    ...(node.props
      ? {
          props: Object.fromEntries(
            Object.entries(node.props).map(([k, v]) => [k, v.map(recurse)]),
          ),
        }
      : {}),
  };
}

function buildExternalMeta(
  meta: Record<string, unknown> | undefined,
  matchedPkg: string,
): Record<string, unknown> {
  const withBadge = { ...meta, ...appendBadge(meta, '📦') };
  const withExternal = { ...withBadge, ...appendTag(withBadge, 'external') };
  const withPkg = { ...withExternal, ...appendTag(withExternal, matchedPkg) };
  return { ...withPkg, style: { fill: '#f0f9ff', stroke: '#7dd3fc' } };
}

function getImportSpecifier(
  tagName: string,
  filePath: string,
  project: Project,
): string | undefined {
  const sf = project.getSourceFile(filePath);
  if (!sf) {
    return undefined;
  }
  for (const importDecl of sf.getImportDeclarations()) {
    const specifier = importDecl.getModuleSpecifierValue();
    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport?.getText() === tagName) {
      return specifier;
    }
    for (const named of importDecl.getNamedImports()) {
      if (named.getName() === tagName || named.getAliasNode()?.getText() === tagName) {
        return specifier;
      }
    }
  }
  return undefined;
}

function matchPackage(specifier: string, packages: string[]): string | undefined {
  return packages.find((pkg) => specifier === pkg || specifier.startsWith(pkg + '/'));
}
