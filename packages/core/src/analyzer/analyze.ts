import { Project, Node, SyntaxKind, type SourceFile } from 'ts-morph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createProject } from '../create-project.js';
import { getDefaultExportedFunction } from '../resolver/get-default-exported-function.js';
import { getNamedExportedFunction } from '../resolver/get-named-exported-function.js';
import { parseJsxElement, parseSelfClosingElement, parseJsxChildren } from './parse-jsx-element.js';
import { resolveNode } from './resolve-node.js';

export interface TreeNode {
  component: string;
  /** Metadata area freely used by annotators (e.g. badges) */
  meta?: Record<string, unknown>;
  condition?: 'ternary' | 'logical';
  branch?: 'consequent' | 'alternate';
  renderProp?: boolean;
  props?: Record<string, TreeNode[]>;
  children: TreeNode[];
}

export interface AnalyzeResult {
  tree: TreeNode;
  project: Project;
  sourceFilePath: string;
}

export interface AnalyzeOptions {
  filePath: string;
  /**
   * Name of the exported component to use as the analysis entry point.
   *
   * Required when the file contains multiple named exported components and
   * has no default export — otherwise the analyzer cannot determine which
   * component to start from. Corresponds to the `--component` CLI option.
   *
   * When omitted, the analyzer resolves the entry point in this order:
   * 1. Default export
   * 2. The single named export, if exactly one exported function component exists
   * 3. Error — if multiple named exports are found, specify `componentName`
   */
  componentName?: string;
  /**
   * A shared Project can be passed in to avoid repeated initialization overhead.
   * This is safe because analysis is purely read-only: source files are only
   * parsed and traversed, never mutated. The only shared state is the SourceFile
   * cache, which ts-morph keys by absolute path — deterministic and side-effect-free.
   */
  project?: Project;
}

export function analyzeRenderTree({
  filePath,
  componentName,
  project,
}: AnalyzeOptions): AnalyzeResult {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  project ??= createProject();
  const sourceFile = project.addSourceFileAtPath(absolutePath);

  const funcNode = resolveFuncNode(sourceFile, componentName);
  if (!funcNode) {
    throw new Error('No exported function component found.');
  }

  const resolvedComponentName = Node.isFunctionDeclaration(funcNode)
    ? (funcNode.getName() ?? 'Anonymous')
    : 'Anonymous';

  const visited = new Set<string>([`${absolutePath}::${resolvedComponentName}`]);
  const shallowChildren = extractJsxFromFunc(funcNode, sourceFile);
  const children = shallowChildren.map((c) => resolveNode(c, absolutePath, project, visited));

  return {
    tree: { component: resolvedComponentName, children },
    project,
    sourceFilePath: absolutePath,
  };
}

function resolveFuncNode(sourceFile: SourceFile, componentName?: string) {
  if (componentName) {
    return getNamedExportedFunction(sourceFile, componentName);
  }
  const defaultFunc = getDefaultExportedFunction(sourceFile);
  if (defaultFunc) {
    return defaultFunc;
  }
  const namedFuncs = [...sourceFile.getExportedDeclarations().keys()]
    .filter((name) => name !== 'default')
    .flatMap((name) => {
      const fn = getNamedExportedFunction(sourceFile, name);
      return fn ? [fn] : [];
    });
  if (namedFuncs.length > 1) {
    throw new Error(
      'Multiple exported function components found. Specify one with --component <name>.',
    );
  }
  return namedFuncs[0];
}

function extractJsxFromFunc(funcNode: Node, sourceFile: SourceFile) {
  for (const ret of funcNode.getDescendantsOfKind(SyntaxKind.ReturnStatement)) {
    const expr = ret.getExpression();
    if (!expr) {
      continue;
    }
    const target = Node.isParenthesizedExpression(expr) ? expr.getExpression() : expr;
    if (Node.isJsxElement(target)) {
      return [parseJsxElement(target, sourceFile)];
    }
    if (Node.isJsxSelfClosingElement(target)) {
      return [parseSelfClosingElement(target, sourceFile)];
    }
    if (Node.isJsxFragment(target)) {
      return parseJsxChildren(target.getJsxChildren(), sourceFile);
    }
  }
  return [];
}
