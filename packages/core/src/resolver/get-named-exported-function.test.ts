import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { getNamedExportedFunction } from './get-named-exported-function.js';

function createFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { jsx: 4 } });
  return project.createSourceFile('test.tsx', code);
}

describe('getNamedExportedFunction', () => {
  it.each([
    {
      label: 'named function declaration',
      code: 'export function Header() { return <h1 />; }',
      name: 'Header',
      expectDefined: true,
    },
    {
      label: 'const arrow function',
      code: 'export const Header = () => <h1 />;',
      name: 'Header',
      expectDefined: true,
    },
    {
      label: 'const function expression',
      code: 'export const Header = function() { return <h1 />; };',
      name: 'Header',
      expectDefined: true,
    },
    {
      label: 'non-existent export name',
      code: 'export function Header() { return <h1 />; }',
      name: 'Footer',
      expectDefined: false,
    },
  ])('$label', ({ code, name, expectDefined }) => {
    const sourceFile = createFile(code);
    expect(getNamedExportedFunction(sourceFile, name) !== undefined).toBe(expectDefined);
  });
});
