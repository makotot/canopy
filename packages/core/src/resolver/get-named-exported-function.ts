import { SourceFile, Node } from 'ts-morph';
import { isFunctionLike } from './is-function-like.js';

export function getNamedExportedFunction(sourceFile: SourceFile, name: string) {
  for (const decl of sourceFile.getExportedDeclarations().get(name) ?? []) {
    if (Node.isFunctionDeclaration(decl)) {
      return decl;
    }
    if (Node.isVariableDeclaration(decl)) {
      const init = decl.getInitializer();
      if (init && isFunctionLike(init)) {
        return init;
      }
    }
  }
  return undefined;
}
