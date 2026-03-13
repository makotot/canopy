import { resolveComponent, resolveModulePath, type Annotator, type TreeNode } from '@makotot/canopy-core';
import { Node, type SourceFile, type Project } from 'ts-morph';
import * as path from 'node:path';

export function createClientBoundaryAnnotator(
  sourceFilePath: string,
  project: Project,
): Annotator<TreeNode> {
  return (tree) => {
    const rootFilePath = path.resolve(sourceFilePath);
    const clientModules = buildClientModuleSet(rootFilePath, project);
    return annotateNode(tree, rootFilePath, project, clientModules);
  };
}

function annotateNode(
  node: TreeNode,
  sourceFilePath: string,
  project: Project,
  clientModules: Set<string>,
): TreeNode {
  const fn = resolveComponent(node.component, sourceFilePath, project);
  const isClient = fn ? clientModules.has(fn.getSourceFile().getFilePath()) : false;
  const childSourceFilePath = fn ? fn.getSourceFile().getFilePath() : sourceFilePath;
  const children = node.children.map((c) => annotateNode(c, childSourceFilePath, project, clientModules));
  return {
    ...node,
    ...(isClient ? {
      meta: {
        ...node.meta,
        client: true,
        badge: 'client',
        group: 'client',
        style: { fill: '#dbeafe', stroke: '#93c5fd' },
      },
    } : {}),
    children,
    ...(node.props
      ? {
          props: Object.fromEntries(
            Object.entries(node.props).map(([k, v]) => [
              k,
              v.map((c) => annotateNode(c, sourceFilePath, project, clientModules)),
            ]),
          ),
        }
      : {}),
  };
}

function buildClientModuleSet(entryFilePath: string, project: Project): Set<string> {
  const importGraph = new Map<string, Set<string>>();
  const discovered = new Set<string>();

  function discoverImports(sf: SourceFile): void {
    const filePath = sf.getFilePath();
    if (discovered.has(filePath)) return;
    discovered.add(filePath);
    importGraph.set(filePath, new Set());

    for (const decl of sf.getImportDeclarations()) {
      const specifier = decl.getModuleSpecifierValue();
      if (!specifier.startsWith('.')) continue;
      const resolved = resolveModulePath(specifier, filePath);
      if (!resolved) continue;
      let targetSf = project.getSourceFile(resolved);
      if (!targetSf) {
        try {
          targetSf = project.addSourceFileAtPath(resolved);
        } catch {
          continue;
        }
      }
      importGraph.get(filePath)?.add(targetSf.getFilePath());
      discoverImports(targetSf);
    }
  }

  const entrySf = project.getSourceFile(entryFilePath);
  if (entrySf) discoverImports(entrySf);

  const clientModules = new Set<string>();
  const visitedClient = new Set<string>();

  function markAsClient(filePath: string): void {
    if (visitedClient.has(filePath)) return;
    visitedClient.add(filePath);
    clientModules.add(filePath);
    for (const imported of importGraph.get(filePath) ?? []) {
      markAsClient(imported);
    }
  }

  for (const filePath of discovered) {
    const sf = project.getSourceFile(filePath);
    if (sf && hasUseClientDirective(sf)) markAsClient(filePath);
  }

  return clientModules;
}

function hasUseClientDirective(sourceFile: SourceFile): boolean {
  const first = sourceFile.getStatements()[0];
  if (!first || !Node.isExpressionStatement(first)) return false;
  const expr = first.getExpression();
  return Node.isStringLiteral(expr) && expr.getLiteralValue() === 'use client';
}
