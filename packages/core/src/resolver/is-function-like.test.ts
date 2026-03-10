import { describe, it, expect } from 'vitest';
import { Project, type SourceFile } from 'ts-morph';
import { isFunctionLike } from './is-function-like.js';

function createFile(code: string): SourceFile {
  const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { jsx: 4 } });
  return project.createSourceFile('test.tsx', code);
}

describe('isFunctionLike', () => {
  it.each([
    {
      label: 'function declaration',
      code: 'function foo() {}',
      getNode: (file: SourceFile) => file.getFunctionOrThrow('foo'),
      expected: true,
    },
    {
      label: 'arrow function',
      code: 'const foo = () => {};',
      getNode: (file: SourceFile) =>
        file.getVariableDeclarationOrThrow('foo').getInitializerOrThrow(),
      expected: true,
    },
    {
      label: 'function expression',
      code: 'const foo = function() {};',
      getNode: (file: SourceFile) =>
        file.getVariableDeclarationOrThrow('foo').getInitializerOrThrow(),
      expected: true,
    },
    {
      label: 'non-function initializer',
      code: 'const x = 1;',
      getNode: (file: SourceFile) =>
        file.getVariableDeclarationOrThrow('x').getInitializerOrThrow(),
      expected: false,
    },
  ])('$label', ({ code, getNode, expected }) => {
    expect(isFunctionLike(getNode(createFile(code)))).toBe(expected);
  });
});
