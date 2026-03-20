import {
  resolveComponent,
  resolveModulePath,
  getNamedExportedFunction,
  appendBadge,
  type Annotator,
  type TreeNode,
} from '@makotot/canopy-core';
import { Node, SyntaxKind, type Project } from 'ts-morph';
import * as path from 'node:path';

const PROVIDER_STYLE = { fill: '#d1fae5', stroke: '#6ee7b7' };
const CONSUMER_STYLE = { fill: '#ede9fe', stroke: '#c4b5fd' };

export function createContextAnnotator(
  sourceFilePath: string,
  project: Project,
): Annotator<TreeNode> {
  const resolvedFilePath = path.resolve(sourceFilePath);
  const hookCache = new Map<string, string[]>();
  let counter = 0;
  const genId = () => `ctx-${counter++}`;

  return (tree) => {
    const annotated = annotateNode(tree, resolvedFilePath, project, hookCache, genId);
    return resolveCrossLinks(annotated);
  };
}

function annotateNode(
  node: TreeNode,
  sourceFilePath: string,
  project: Project,
  hookCache: Map<string, string[]>,
  genId: () => string,
): TreeNode {
  const funcNode = resolveComponent(node.component, sourceFilePath, project);

  const children = node.children.map((c) =>
    annotateNode(c, sourceFilePath, project, hookCache, genId),
  );
  const props = node.props
    ? Object.fromEntries(
        Object.entries(node.props).map(([k, v]) => [
          k,
          v.map((c) => annotateNode(c, sourceFilePath, project, hookCache, genId)),
        ]),
      )
    : undefined;

  const newTags: string[] = [];

  if (node.component.endsWith('.Provider')) {
    newTags.push(`provides:${node.component.slice(0, -'.Provider'.length)}`);
  } else if (node.component.endsWith('.Consumer')) {
    newTags.push(`consumes:${node.component.slice(0, -'.Consumer'.length)}`);
  }

  if (funcNode) {
    const funcFilePath = funcNode.getSourceFile().getFilePath();
    for (const ctx of findProvidedContexts(funcNode)) {
      const tag = `provides:${ctx}`;
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    }
    for (const ctx of findConsumedContexts(funcNode, funcFilePath, project, new Set(), hookCache)) {
      const tag = `consumes:${ctx}`;
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    }
  }

  if (newTags.length === 0) {
    return { ...node, children, ...(props ? { props } : {}) };
  }

  const hasProvides = newTags.some((t) => t.startsWith('provides:'));
  const hasConsumes = newTags.some((t) => t.startsWith('consumes:'));
  const existingTags = (node.meta?.tags as string[] | undefined) ?? [];
  const style = hasProvides ? PROVIDER_STYLE : CONSUMER_STYLE;
  const linkId = hasConsumes ? genId() : undefined;

  return {
    ...node,
    meta: {
      ...node.meta,
      ...appendBadge(node.meta, '◎'),
      tags: [...existingTags, ...newTags],
      style,
      ...(linkId ? { linkId } : {}),
    },
    children,
    ...(props ? { props } : {}),
  };
}

function resolveCrossLinks(tree: TreeNode): TreeNode {
  const pairs: Array<{ providerNode: TreeNode; targetId: string; label: string }> = [];
  const providerStack = new Map<string, TreeNode[]>();

  function collect(node: TreeNode): void {
    const tags = (node.meta?.tags as string[] | undefined) ?? [];
    const provides = tags
      .filter((t) => t.startsWith('provides:'))
      .map((t) => t.slice('provides:'.length));
    const consumes = tags
      .filter((t) => t.startsWith('consumes:'))
      .map((t) => t.slice('consumes:'.length));

    for (const ctx of provides) {
      const stack = providerStack.get(ctx) ?? [];
      stack.push(node);
      providerStack.set(ctx, stack);
    }

    for (const ctx of consumes) {
      const stack = providerStack.get(ctx);
      const nearestProvider = stack?.[stack.length - 1];
      const linkId = node.meta?.linkId as string | undefined;
      if (nearestProvider && linkId) {
        pairs.push({ providerNode: nearestProvider, targetId: linkId, label: ctx });
      }
    }

    for (const child of node.children) {
      collect(child);
    }
    if (node.props) {
      for (const propNodes of Object.values(node.props)) {
        for (const propNode of propNodes) {
          collect(propNode);
        }
      }
    }

    for (const ctx of provides) {
      providerStack.get(ctx)?.pop();
    }
  }

  collect(tree);

  const crossLinksMap = new Map<TreeNode, Array<{ targetId: string; label: string }>>();
  for (const { providerNode, targetId, label } of pairs) {
    const existing = crossLinksMap.get(providerNode) ?? [];
    existing.push({ targetId, label });
    crossLinksMap.set(providerNode, existing);
  }

  function apply(node: TreeNode): TreeNode {
    const links = crossLinksMap.get(node);
    const children = node.children.map(apply);
    return {
      ...node,
      ...(links ? { meta: { ...node.meta, crossLinks: links } } : {}),
      children,
      ...(node.props
        ? {
            props: Object.fromEntries(
              Object.entries(node.props).map(([k, v]) => [k, v.map(apply)]),
            ),
          }
        : {}),
    };
  }

  return apply(tree);
}

function findProvidedContexts(funcNode: Node): string[] {
  const contexts: string[] = [];
  for (const el of funcNode.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)) {
    const tag = el.getTagNameNode().getText();
    if (tag.endsWith('.Provider')) {
      contexts.push(tag.slice(0, -'.Provider'.length));
    }
  }
  for (const el of funcNode.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)) {
    const tag = el.getTagNameNode().getText();
    if (tag.endsWith('.Provider')) {
      contexts.push(tag.slice(0, -'.Provider'.length));
    }
  }
  return [...new Set(contexts)];
}

function findConsumedContexts(
  funcNode: Node,
  sourceFilePath: string,
  project: Project,
  visited: Set<Node>,
  hookCache: Map<string, string[]>,
): string[] {
  if (visited.has(funcNode)) {
    return [];
  }
  visited.add(funcNode);

  const contexts: string[] = [];

  for (const call of funcNode.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expr = call.getExpression();
    let calleeName: string | undefined;
    if (Node.isIdentifier(expr)) {
      calleeName = expr.getText();
    } else if (Node.isPropertyAccessExpression(expr)) {
      calleeName = expr.getName();
    }

    if (!calleeName) {
      continue;
    }

    if (calleeName === 'useContext') {
      const arg = call.getArguments()[0];
      if (arg) {
        contexts.push(arg.getText());
      }
      continue;
    }

    if (calleeName === 'use') {
      const arg = call.getArguments()[0];
      if (arg && looksLikeContext(arg.getText())) {
        contexts.push(arg.getText());
      }
      continue;
    }

    if (calleeName.startsWith('use')) {
      const funcSourceFilePath = funcNode.getSourceFile().getFilePath();
      if (hookCache.has(calleeName)) {
        contexts.push(...(hookCache.get(calleeName) ?? []));
        continue;
      }
      const hookFunc = resolveHookFunc(calleeName, funcSourceFilePath, project);
      if (hookFunc) {
        const hookContexts = findConsumedContexts(
          hookFunc,
          funcSourceFilePath,
          project,
          visited,
          hookCache,
        );
        hookCache.set(calleeName, hookContexts);
        contexts.push(...hookContexts);
      }
    }
  }

  return [...new Set(contexts)];
}

function resolveHookFunc(
  hookName: string,
  sourceFilePath: string,
  project: Project,
): Node | undefined {
  const sf = project.getSourceFile(sourceFilePath);
  if (!sf) {
    return undefined;
  }

  for (const funcDecl of sf.getFunctions()) {
    if (funcDecl.getName() === hookName) {
      return funcDecl;
    }
  }
  for (const varDecl of sf.getVariableDeclarations()) {
    if (varDecl.getName() === hookName) {
      const init = varDecl.getInitializer();
      if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
        return init;
      }
    }
  }

  for (const importDecl of sf.getImportDeclarations()) {
    const specifier = importDecl.getModuleSpecifierValue();
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) {
      continue;
    }

    for (const named of importDecl.getNamedImports()) {
      if (named.getName() === hookName || named.getAliasNode()?.getText() === hookName) {
        const originalName = named.getName();
        const resolved = resolveModulePath(specifier, sourceFilePath);
        if (!resolved) {
          continue;
        }
        let targetSf = project.getSourceFile(resolved);
        if (!targetSf) {
          try {
            targetSf = project.addSourceFileAtPath(resolved);
          } catch {
            continue;
          }
        }
        return getNamedExportedFunction(targetSf, originalName);
      }
    }
  }

  return undefined;
}

function looksLikeContext(argText: string): boolean {
  return argText.includes('Context');
}
