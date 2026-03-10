import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { getDefaultExportedFunction } from './get-default-exported-function.js';

function createFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { jsx: 4 } });
  return project.createSourceFile('test.tsx', code);
}

describe('getDefaultExportedFunction', () => {
  it.each([
    {
      label: 'function declaration',
      code: 'export default function Page() { return <div />; }',
      expectDefined: true,
    },
    {
      label: 'arrow function expression',
      code: 'export default () => <div />;',
      expectDefined: true,
    },
    {
      label: 'function expression',
      code: 'export default function() { return <div />; }',
      expectDefined: true,
    },
    {
      label: 'const arrow assigned then exported',
      code: 'const Page = () => <div />;\nexport default Page;',
      expectDefined: true,
    },
    {
      label: 'no default export',
      code: 'export function Page() { return <div />; }',
      expectDefined: false,
    },
  ])('$label', ({ code, expectDefined }) => {
    const sourceFile = createFile(code);
    expect(getDefaultExportedFunction(sourceFile) !== undefined).toBe(expectDefined);
  });
});
