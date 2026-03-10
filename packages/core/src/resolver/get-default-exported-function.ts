import { SourceFile, Node } from 'ts-morph';
import { isFunctionLike } from './is-function-like.js';

export function getDefaultExportedFunction(sourceFile: SourceFile) {
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (!defaultExport) {
    return undefined;
  }

  for (const decl of defaultExport.getDeclarations()) {
    if (Node.isFunctionDeclaration(decl)) {
      return decl;
    }
    if (Node.isExportAssignment(decl)) {
      const expr = decl.getExpression();
      if (Node.isFunctionExpression(expr) || Node.isArrowFunction(expr)) {
        return expr;
      }
      if (Node.isIdentifier(expr)) {
        const resolved = resolveIdentifierToFunction(expr.getSymbol());
        if (resolved) {
          return resolved;
        }
      }
    }
  }
  return undefined;
}

function resolveIdentifierToFunction(sym: ReturnType<typeof Node.prototype.getSymbol>) {
  if (!sym) {
    return undefined;
  }
  for (const d of sym.getDeclarations()) {
    if (Node.isFunctionDeclaration(d)) {
      return d;
    }
    if (Node.isVariableDeclaration(d)) {
      const init = d.getInitializer();
      if (init && isFunctionLike(init)) {
        return init;
      }
    }
  }
  return undefined;
}
