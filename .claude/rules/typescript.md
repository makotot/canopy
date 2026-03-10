---
paths: **/*.ts
---

# TypeScript Rules

## Documentation

- Mark package-internal exported functions with a `/** @internal */` JSDoc comment on the line before the function declaration.

## File Organization

- In `.ts` files, place exported symbols (functions, types, interfaces, constants) as close to the top of the file as possible. Internal (non-exported) helpers should follow after the exports.
- Match the filename directly to the primary exported function name (e.g. `resolve-module-path.ts` exports `resolveModulePath`, `resolve-component.ts` exports `resolveComponent`).

## Style

- Prefer declarative implementations over imperative ones where possible.
- Leverage TypeScript type inference. Omit explicit return type annotations where the return type is obvious from the implementation.
