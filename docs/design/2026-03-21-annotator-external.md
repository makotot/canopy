# Design: `@makotot/canopy-annotator-external`

- **Date**: 2026-03-21

## Overview

`@makotot/canopy-annotator-external` detects components imported from user-specified npm packages and annotates each matching `TreeNode` with a visual badge and style.

Unlike other annotators that inspect code structure or React semantics, this annotator operates on **import specifiers**. It does not follow into node_modules — it matches the import path string against the user-supplied package list.

---

## Detection Targets

| Pattern               | Example                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| Exact package name    | `import { Button } from 'lucide-react'`                                 |
| Scoped package prefix | `import { Dialog } from '@radix-ui/react-dialog'` matches `"@radix-ui"` |

Match rule: `specifier === pkg || specifier.startsWith(pkg + '/')`

Only components rendered in JSX are checked. Non-JSX imports (utilities, types) are not annotated.

---

## Mermaid Output Image

Given this component tree and `packages: ["@radix-ui", "lucide-react"]`:

```tsx
// App.tsx
import { Dialog } from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { Header } from './Header';

export default function App() {
  return (
    <div>
      <Header />
      <Search />
      <Dialog />
    </div>
  );
}
```

Expected Mermaid output:

```
flowchart TD
  n0["App"]
  n0 --> n1
  n1["div"]
  n1 --> n2
  n2["Header"]
  n1 --> n3
  n3["Search<br/>📦"]
  n1 --> n4
  n4["Dialog<br/>📦"]
  style n3 fill:#f0f9ff,stroke:#7dd3fc
  style n4 fill:#f0f9ff,stroke:#7dd3fc
```

---

## API

```typescript
export interface ExternalAnnotatorOptions {
  packages: string[];
}

export function createExternalAnnotator(
  sourceFilePath: string,
  project: Project,
  options: ExternalAnnotatorOptions,
): Annotator<TreeNode>;
```

### `options.packages`

An array of package names or scoped package prefixes to match against.

```
["lucide-react"]                       // exact match only
["@radix-ui"]                          // matches @radix-ui/react-dialog, @radix-ui/react-tooltip, ...
["@radix-ui", "react-hook-form"]
```

---

## Metadata

| Field        | Value                                    | Purpose                                                                   |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| `meta.badge` | `"📦"` (appended to `string[]`)          | Rendered as `ComponentName<br/>📦` in the Mermaid node                    |
| `meta.tags`  | `["external", "<pkg-name>"]`             | Semantic label; `<pkg-name>` is the matched entry from `options.packages` |
| `meta.style` | `{ fill: '#f0f9ff', stroke: '#7dd3fc' }` | Light blue node highlight                                                 |

---

## Detection Logic

Resolution uses `resolveComponent()` from `@makotot/canopy-core` to obtain the import specifier for a given JSX tag name. The specifier is then matched against `options.packages`:

```
JSX tag name
  → resolveComponent() → import specifier (or undefined if unresolvable / relative)
  → skip if relative path (starts with "." or "/")
  → check: specifier === pkg || specifier.startsWith(pkg + '/')
  → if matched: appendBadge, appendTag, set meta.style
```

Relative imports are always skipped — they are project-internal components.

---

## CLI Integration

The annotator is wired up using option 3: the CLI layer assembles annotator factories and passes them to `run()` as `((sourceFilePath, project) => Annotator<TreeNode>)[]`. `run()` has no knowledge of annotator-specific options.

### CLI flags

```
--annotator external --external-packages <pkg,...>
```

`--external-packages` accepts a comma-separated list:

```
canopy src/App.tsx --annotator external --external-packages "@radix-ui,lucide-react"
```

### Internal wiring

```typescript
// cli.ts
.option('--external-packages <pkgs>', 'Comma-separated package names for external annotator')

// buildAnnotators() in cli layer
if (name === 'external') {
  const packages = (externalPackages ?? '').split(',').filter(Boolean);
  return (sf, p) => createExternalAnnotator(sf, p, { packages });
}

// run.ts receives pre-built factories, no option awareness
run(file, out, undefined, component, annotatorFactories);
```

This design allows future config-file support (`canopy.config.ts`) to assemble the same factory array without touching `run()`.

---

## Test Strategy

### Unit tests

- Component from `lucide-react` is annotated when `packages: ["lucide-react"]`
- Component from `@radix-ui/react-dialog` is annotated when `packages: ["@radix-ui"]`
- Component from an unspecified package is not annotated
- Relative-import component is not annotated
- `meta.badge` contains `"📦"`, `meta.tags` contains `"external"` and the matched package name
- `meta.style` is set on matched nodes

### Snapshot tests (integration)

```
fixtures/
  external/
    App.tsx           # uses @radix-ui/react-dialog and lucide-react
    expected.md       # Mermaid output with 📦 badges and light-blue styles
```

---

## Files Changed

### New

| Path                           | Description                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `packages/annotator-external/` | New package: `package.json`, `tsconfig.json`, `src/index.ts`, tests, fixtures |

### Modified

| File                             | Change                                                                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/cli/src/run.ts`        | Fifth argument type changed from `string[]` to `((sf: string, p: Project) => Annotator<TreeNode>)[]`. Remove ANNOTATORS map lookup and unknown-annotator validation. |
| `packages/cli/src/annotators.ts` | Replace `ANNOTATORS` record with a `buildAnnotators()` function that returns pre-built factories. Add `external` case that reads `packages` from options.            |
| `packages/cli/src/cli.ts`        | Add `--external-packages <pkgs>` option. Call `buildAnnotators()` instead of passing raw annotator names.                                                            |
| `packages/cli/src/run.test.ts`   | Update fifth argument call sites to pass factory arrays. Move unknown-annotator error test to `annotators.ts` unit tests.                                            |

Changes are scoped entirely to `packages/annotator-external/` and `packages/cli/`. No changes to `packages/core/` or other annotator packages.

---

## Scope (v0.1)

**In scope:**

- Match by package name or scoped prefix
- Badge, tag, and style annotation
- CLI flag `--external-packages`

**Out of scope:**

- Auto-detect all external packages (no `packages` option required)
- Per-package badge or color customization
- Displaying package version in the diagram
- Config file support (deferred to future config infrastructure)
