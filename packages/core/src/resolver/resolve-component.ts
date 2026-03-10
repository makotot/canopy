import { Project, SourceFile } from 'ts-morph';
import { isFunctionLike } from './is-function-like.js';
import { isComponentTag } from './is-component-tag.js';
import { resolveModulePath } from './resolve-module-path.js';
import { getDefaultExportedFunction } from './get-default-exported-function.js';
import { getNamedExportedFunction } from './get-named-exported-function.js';

export function resolveComponent(tagName: string, sourceFilePath: string, project: Project) {
  if (!isComponentTag(tagName)) {
    return undefined;
  }

  const sf = project.getSourceFile(sourceFilePath);
  if (!sf) {
    return undefined;
  }

  return resolveFromImports(tagName, sf, sourceFilePath, project) ?? resolveLocally(tagName, sf);
}

function resolveFromImports(
  tagName: string,
  sf: SourceFile,
  sourceFilePath: string,
  project: Project,
) {
  for (const importDecl of sf.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (!moduleSpecifier.startsWith('.') && !moduleSpecifier.startsWith('@')) {
      continue;
    }

    const defaultImport = importDecl.getDefaultImport();
    if (defaultImport && defaultImport.getText() === tagName) {
      const targetSf = loadSourceFile(moduleSpecifier, sourceFilePath, project);
      return targetSf ? getDefaultExportedFunction(targetSf) : undefined;
    }

    for (const named of importDecl.getNamedImports()) {
      if (named.getName() === tagName || named.getAliasNode()?.getText() === tagName) {
        const targetSf = loadSourceFile(moduleSpecifier, sourceFilePath, project);
        return targetSf ? getNamedExportedFunction(targetSf, named.getName()) : undefined;
      }
    }
  }
  return undefined;
}

function resolveLocally(tagName: string, sf: SourceFile) {
  for (const funcDecl of sf.getFunctions()) {
    if (funcDecl.getName() === tagName) {
      return funcDecl;
    }
  }
  for (const varDecl of sf.getVariableDeclarations()) {
    if (varDecl.getName() === tagName) {
      const init = varDecl.getInitializer();
      if (init && isFunctionLike(init)) {
        return init;
      }
    }
  }
  return undefined;
}

function loadSourceFile(moduleSpecifier: string, fromFilePath: string, project: Project) {
  const resolved = resolveModulePath(moduleSpecifier, fromFilePath);
  if (!resolved) {
    return undefined;
  }
  try {
    return project.getSourceFile(resolved) ?? project.addSourceFileAtPath(resolved);
  } catch {
    return undefined;
  }
}

