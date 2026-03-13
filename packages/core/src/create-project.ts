import { Project, ts } from 'ts-morph';

export function createProject() {
  return new Project({ compilerOptions: { jsx: ts.JsxEmit.ReactJSX } });
}
