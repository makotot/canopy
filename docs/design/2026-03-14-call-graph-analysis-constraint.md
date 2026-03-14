# Call Graph Analysis: Why It Cannot Be an Annotator

- **Date**: 2026-03-14

## Overview

Some annotation ideas require **call graph traversal** — following function calls from a component body through to the functions they invoke, and recursively through those functions. For example, detecting whether a component makes external HTTP requests would require tracing:

```
Page()
  → fetchData()
    → fetch("https://api.example.com/data")
```

This document records the decision that **call graph traversal is not a viable technique for annotators** in Canopy, and which planned annotators are ruled out as a result.

---

## What Call Graph Analysis Would Require

To trace fetch requests from a component to the actual request function, an annotator would need to:

1. Parse every `CallExpression` inside a component function body.
2. Resolve each callee to its definition (which may be in another file).
3. Recursively expand the resolved function's body, collecting its call expressions.
4. Repeat until a known "leaf" (e.g. `fetch`, `axios.get`) is reached or a depth limit is hit.

This is a **transitive closure over the call graph**: a potentially unbounded, cross-file traversal that requires resolving and type-checking every call site.

---

## Why It Is Impractical

### 1. Unbounded traversal depth

React components typically call utility functions, which call other utility functions, which call library code. Following every call chain to its leaf can mean visiting dozens or hundreds of function bodies per component.

### 2. Cross-file resolution at every step

Unlike the render tree (which follows JSX imports, a well-structured subset), function calls can reference anything in the project or in `node_modules`. Each step requires file I/O, ts-morph `SourceFile` loading, and type resolution.

### 3. Exponential branching

Functions called inside a component are rarely exclusive to that component. Shared utilities appear in many call chains. Without perfect memoization of every intermediate result, the same subtrees are recomputed for every component.

### 4. Type-checking overhead

Determining what a call expression actually calls (especially through re-exports, dynamic imports, or higher-order functions) requires the TypeScript type checker — orders of magnitude slower than syntactic AST walking.

### Combined effect

For a realistic Next.js `app/` directory with dozens of components, call graph traversal would make `canopy` too slow for practical use (seconds to minutes per run). Canopy's primary value proposition is fast, lightweight static analysis — this tradeoff is unacceptable.

---

## Design Constraint

> **Annotators in Canopy are limited to analysis that can be performed with shallow AST inspection.**
>
> "Shallow" means: reading the AST of the component's own source file and its directly resolved imports (one hop), without recursively following function call chains.

Annotators may:

- Inspect a component's own function body (e.g. `isAsync()`, `"use client"` directive).
- Follow import declarations one level deep to resolve which file a component comes from.
- Walk the JSX subtree (render tree), since that is already pre-computed by `analyzeRenderTree`.

Annotators must not:

- Follow `CallExpression` nodes to their resolved function bodies.
- Build or traverse a call graph.
- Perform transitive analysis beyond one file hop.

---

## Annotators Ruled Out

### `@makotot/canopy-annotator-external`

The original intent was to mark components that make external HTTP requests (e.g. `fetch`, `axios`, `ky`). This inherently requires call graph traversal to determine whether a component (or anything it calls) ultimately reaches a network request.

**Decision**: Remove from scope. This annotator cannot be implemented within the performance constraints of Canopy.

---

## Alternatives

If call-graph-based annotations are needed in the future, consider:

- **Convention-based detection**: Require that data-fetching functions follow a naming convention (e.g. prefix with `fetch*`) and only look for direct top-level calls to those functions inside the component body. This is shallow and fast, but requires the codebase to follow the convention.
- **Separate analysis mode**: Introduce an explicit `--deep` flag that opts into slower, call-graph-aware analysis. Users who need it accept the performance tradeoff deliberately.
- **File-level heuristics**: Check whether the component's source file (or direct imports) imports known HTTP libraries (`node-fetch`, `axios`, etc.) as a proxy for "this component family does network I/O." Imprecise but O(1) per file.

These alternatives are not implemented in v0.x and are left for future consideration.
