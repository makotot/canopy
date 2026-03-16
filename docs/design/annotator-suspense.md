# Design: `@makotot/canopy-annotator-suspense`

## Overview

`annotator-suspense` marks React `<Suspense>` boundaries in the render tree by annotating those nodes with metadata. Downstream reporters (e.g., `reporter-mermaid`) can then visually distinguish Suspense boundaries from regular components.

---

## Detection Strategy

### What to detect

React's `<Suspense>` is a built-in component exported from `'react'`. It can appear in JSX in two forms:

| JSX form           | Import pattern                                                 | `node.component` in tree |
| ------------------ | -------------------------------------------------------------- | ------------------------ |
| `<Suspense>`       | `import { Suspense } from 'react'`                             | `'Suspense'`             |
| `<React.Suspense>` | `import React from 'react'` / `import * as React from 'react'` | `'React.Suspense'`       |

Both forms must be detected and annotated.

### Detection algorithm

1. Walk the entire `TreeNode` tree recursively (depth-first).
2. For each node, determine whether it represents a React Suspense boundary using **either** of the two strategies below:

   **Case A — named import (`<Suspense>`):**
   - Check `node.component === 'Suspense'`.
   - Look up the import declaration for `Suspense` in the source file via ts-morph.
   - Confirm the module specifier is `'react'`.

   **Case B — member expression (`<React.Suspense>`):**
   - Check `node.component === 'React.Suspense'`.
   - Look up the import for `React` (default or namespace) in the source file.
   - Confirm it resolves to `'react'`.

3. Annotate matching nodes with Suspense metadata (see below).
4. Also walk `node.props` recursively so that Suspense inside a `fallback` prop is annotated too.

### Why verify the import source

A user might have a local component named `Suspense`. Checking the import source prevents false positives.

---

## Metadata Schema

```typescript
// Added to node.meta for Suspense boundary nodes
{
  suspense: true,
  badge: 'Suspense',
  style: {
    fill: '#fef9c3',   // yellow-100
    stroke: '#fde047', // yellow-300
  },
}
```

| Key        | Type    | Purpose                                               |
| ---------- | ------- | ----------------------------------------------------- |
| `suspense` | boolean | Machine-readable flag for other annotators/reporters  |
| `badge`    | string  | Displayed as `"Suspense [Suspense]"` in Mermaid nodes |
| `style`    | object  | Yellow fill/stroke to distinguish boundaries visually |

---

## API Design

```typescript
// packages/annotator-suspense/src/index.ts
import type { Annotator, TreeNode } from '@makotot/canopy-core';
import type { Project } from 'ts-morph';

export function createSuspenseAnnotator(
  sourceFilePath: string,
  project: Project,
): Annotator<TreeNode>;
```

Consistent with the factory pattern used by `annotator-async` and `annotator-client-boundary`.

### Internal helpers

```typescript
function isSuspenseBoundary(component: string, sourceFilePath: string, project: Project): boolean;
// Returns true for both '<Suspense>' (named import) and '<React.Suspense>' (member expression),
// verifying in both cases that the module specifier resolves to 'react'.

function annotateNode(node: TreeNode, sourceFilePath: string, project: Project): TreeNode;
// Recursively walks children and props, annotating Suspense boundary nodes.
```

---

## Package Structure

```
packages/annotator-suspense/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # createSuspenseAnnotator
│   └── index.test.ts     # vitest tests
└── __fixtures__/
    ├── page-with-suspense.tsx                 # Named import: <Suspense>
    ├── page-with-react-suspense.tsx           # Member expression: <React.Suspense>
    ├── page-with-nested-suspense.tsx          # Multiple nested Suspense boundaries
    ├── page-with-suspense-fallback.tsx        # Suspense with JSX fallback prop
    └── page-with-local-suspense.tsx           # Local component named Suspense (false-positive guard)
```

---

## Fixture Scenarios

### 1. `page-with-suspense.tsx` — named import

```tsx
import { Suspense } from 'react';
import AsyncWidget from './async-widget';

export default function Page() {
  return (
    <main>
      <Suspense fallback={<p>Loading…</p>}>
        <AsyncWidget />
      </Suspense>
    </main>
  );
}
```

Expected tree after annotation:

```
Page
└── main
    └── Suspense  ← meta.suspense=true, meta.badge='Suspense', meta.style={fill:'#fef9c3',stroke:'#fde047'}
        └── AsyncWidget
```

### 2. `page-with-react-suspense.tsx` — member expression

```tsx
import React from 'react';
import AsyncWidget from './async-widget';

export default function Page() {
  return (
    <main>
      <React.Suspense fallback={<p>Loading…</p>}>
        <AsyncWidget />
      </React.Suspense>
    </main>
  );
}
```

`node.component` will be `'React.Suspense'`. Must be annotated identically to the named-import case.

### 3. `page-with-nested-suspense.tsx` — nested boundaries

```tsx
import { Suspense } from 'react';
import Outer from './outer';
import Inner from './inner';

export default function Page() {
  return (
    <Suspense fallback={<p>Outer loading…</p>}>
      <Outer>
        <Suspense fallback={<p>Inner loading…</p>}>
          <Inner />
        </Suspense>
      </Outer>
    </Suspense>
  );
}
```

Both `Suspense` nodes must be annotated independently.

### 4. `page-with-suspense-fallback.tsx` — JSX fallback prop

```tsx
import { Suspense } from 'react';
import AsyncWidget from './async-widget';
import Spinner from './spinner';

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <AsyncWidget />
    </Suspense>
  );
}
```

`Spinner` appears in `node.props['fallback']`. The annotator must walk `node.props` to ensure nested Suspense inside a fallback is also annotated.

### 5. `page-with-local-suspense.tsx` — false-positive guard

```tsx
// Local component named Suspense — NOT from 'react'
function Suspense({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default function Page() {
  return (
    <Suspense>
      <span />
    </Suspense>
  );
}
```

The locally defined `Suspense` must **not** receive Suspense metadata.

---

## Mermaid Output Example

For `page-with-suspense.tsx`, expected Mermaid output (combined with `reporter-mermaid`):

```
flowchart TD
  n0["Page"]
  n1["main"]
  n2["Suspense [Suspense]"]
  n3["AsyncWidget"]
  n0 --> n1
  n1 --> n2
  n2 --> n3
  style n2 fill:#fef9c3,stroke:#fde047
```

---

## Test Plan

| Fixture                       | Assertions                                                                 |
| ----------------------------- | -------------------------------------------------------------------------- |
| `page-with-suspense`          | Suspense node: `meta.suspense === true`, `badge === 'Suspense'`, style set |
| `page-with-react-suspense`    | `React.Suspense` node annotated identically to named-import case           |
| `page-with-nested-suspense`   | Both Suspense nodes annotated; non-Suspense nodes unaffected               |
| `page-with-suspense-fallback` | Suspense node annotated; `props.fallback` subtree traversed without error  |
| `page-with-local-suspense`    | Local `Suspense` has no `meta.suspense`                                    |

---

## Integration with CLI

Add `createSuspenseAnnotator` to the CLI's annotator registry alongside `async` and `client-boundary`:

```typescript
// packages/cli/src/annotators.ts  (existing file)
import { createSuspenseAnnotator } from '@makotot/canopy-annotator-suspense'

// inside buildAnnotators():
createSuspenseAnnotator(sourceFilePath, project),
```

---

## Open Questions

1. **`fallback` prop with component references** — If `fallback={<Spinner />}`, `Spinner` appears in `node.props['fallback']`. Should fallback-only components be marked with e.g. `meta.suspenseFallback: true` for richer visualization? Deferred to v0.2.
2. **Interaction with `annotator-async`** — A component inside a Suspense boundary is often async. The two annotations are independent and additive; `meta.async` and `meta.suspense` can coexist on the same subtree without conflict.
