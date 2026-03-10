import { Project, Node, SyntaxKind, type SourceFile } from 'ts-morph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getDefaultExportedFunction } from '../resolver/get-default-exported-function.js';
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

export function analyzeRenderTree(filePath: string): AnalyzeResult {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const project = new Project({ compilerOptions: { jsx: 4 } });
  const sourceFile = project.addSourceFileAtPath(absolutePath);

  const funcNode = getDefaultExportedFunction(sourceFile);
  if (!funcNode) {
    throw new Error('No default exported function component found.');
  }

  const componentName = Node.isFunctionDeclaration(funcNode)
    ? (funcNode.getName() ?? 'Anonymous')
    : 'Anonymous';

  const visited = new Set<string>([`${absolutePath}::${componentName}`]);
  const shallowChildren = extractJsxFromFunc(funcNode, sourceFile);
  const children = shallowChildren.map((c) => resolveNode(c, absolutePath, project, visited));

  return {
    tree: { component: componentName, children },
    project,
    sourceFilePath: absolutePath,
  };
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
