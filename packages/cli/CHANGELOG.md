# @makotot/canopy-cli

## 0.8.1

### Patch Changes

- Updated dependencies [f4f6613]
  - @makotot/canopy-core@0.4.1
  - @makotot/canopy-annotator-async@0.5.1
  - @makotot/canopy-annotator-client-boundary@0.3.1
  - @makotot/canopy-annotator-context@0.3.1
  - @makotot/canopy-annotator-external@0.2.1
  - @makotot/canopy-annotator-suspense@0.3.1
  - @makotot/canopy-reporter-mermaid@0.4.1

## 0.8.0

### Minor Changes

- 648f4e7: Add `@makotot/canopy-annotator-external`, a new annotator that marks components imported from user-specified npm packages with a 📦 badge and light-blue highlight. Activate it with `--annotator external --external-packages "<pkg1>,<pkg2>"`, where each entry is an exact package name (e.g. `lucide-react`) or a scoped prefix (e.g. `@radix-ui`, which matches `@radix-ui/react-dialog` and any other package under that scope). Interactive mode prompts for package names when `external` is selected.

  The CLI's internal annotator wiring has been refactored: annotators are now assembled as pre-built factory functions before being passed to `run()`, which decouples annotator-specific options (such as `--external-packages`) from the runner and makes it straightforward to add further option-bearing annotators in future.

### Patch Changes

- Updated dependencies [648f4e7]
  - @makotot/canopy-annotator-external@0.2.0

## 0.7.1

### Patch Changes

- Updated dependencies [c16da94]
  - @makotot/canopy-core@0.4.0
  - @makotot/canopy-reporter-mermaid@0.4.0
  - @makotot/canopy-annotator-async@0.5.0
  - @makotot/canopy-annotator-client-boundary@0.3.0
  - @makotot/canopy-annotator-suspense@0.3.0
  - @makotot/canopy-annotator-context@0.3.0

## 0.7.0

### Minor Changes

- 35bd214: Adds `@makotot/canopy-annotator-context`, a new annotator that detects React Context providers and consumers in the render tree. Provider nodes are annotated with a `provides:ContextName` badge (green) and consumer nodes with a `consumes:ContextName` badge (purple). The annotator resolves custom hooks recursively, so `useAuth()` wrapping `useContext(AuthContext)` is detected correctly. Provider–consumer pairs are connected by dashed cross-edges in the Mermaid output, with each consumer linked to its nearest ancestor provider. Enable with `--annotator context`. This release also extends `@makotot/canopy-reporter-mermaid` with support for the new `meta.linkId` and `meta.crossLinks` convention fields that power the cross-edge rendering.

### Patch Changes

- Updated dependencies [35bd214]
  - @makotot/canopy-annotator-context@0.2.0
  - @makotot/canopy-reporter-mermaid@0.3.0

## 0.6.0

### Minor Changes

- 73f8211: Suspense boundary detection is now available. Pass `--annotator suspense` to the CLI (or use `createSuspenseAnnotator` directly) to mark React `<Suspense>` boundaries in the render tree. Both `<Suspense>` (named import) and `<React.Suspense>` (member expression) are detected. Boundary nodes receive a yellow highlight in Mermaid output; locally-defined components named `Suspense` are not affected.

### Patch Changes

- Updated dependencies [73f8211]
  - @makotot/canopy-annotator-suspense@0.2.0

## 0.5.1

### Patch Changes

- Updated dependencies [d332209]
  - @makotot/canopy-reporter-mermaid@0.2.1

## 0.5.0

### Minor Changes

- 8b50430: Add -i / --interactive flag to the canopy command. When specified, the CLI prompts for the entry point file, component name, and annotators interactively instead of requiring them as arguments.

## 0.4.0

### Minor Changes

- 7d3c7ed: Annotators are now opt-in via `--annotator <name>`. Added `--annotator client-boundary` to detect RSC client
  boundaries.

  **Breaking (cli):** Async annotation no longer runs automatically. Use `--annotator async` to enable it.

  **New package:** `@makotot/canopy-annotator-client-boundary` — marks components in `"use client"` files and their
  transitive imports with `meta.client`, `meta.badge`, `meta.group`, and `meta.style`.

  **reporter-mermaid:** Rendering now driven by generic `meta.badge` / `meta.group` / `meta.style` fields. Components
  with `meta.group` are wrapped in a Mermaid `subgraph` block.

  **annotator-async:** Now sets `meta.badge: 'async'` alongside `meta.async: true`.

### Patch Changes

- Updated dependencies [7d3c7ed]
  - @makotot/canopy-annotator-client-boundary@0.2.0
  - @makotot/canopy-reporter-mermaid@0.2.0
  - @makotot/canopy-annotator-async@0.4.0

## 0.3.0

### Minor Changes

- 1a4f11e: Added --component <name> option to specify which named exported component to analyze. Required when the file exports multiple components and has no default export.

### Patch Changes

- Updated dependencies [1a4f11e]
  - @makotot/canopy-annotator-async@0.3.0
  - @makotot/canopy-core@0.3.0
  - @makotot/canopy-reporter-mermaid@0.1.2

## 0.2.0

### Minor Changes

- 6a9b4a5: Add optional project parameter to analyzeRenderTree and export createProject. Callers can now pass a shared Project instance to avoid repeated initialization overhead.

### Patch Changes

- Updated dependencies [6a9b4a5]
  - @makotot/canopy-annotator-async@0.2.0
  - @makotot/canopy-core@0.2.0
  - @makotot/canopy-reporter-mermaid@0.1.1

## 0.1.1

### Patch Changes

- 98e1a60: Add sheban to cli

## 0.1.0

### Minor Changes

- 1fcf0a1: Initial release of Canopy v0.1.0 — statically analyze React component render trees and visualize them as Mermaid flowcharts.

### Patch Changes

- Updated dependencies [1fcf0a1]
  - @makotot/canopy-annotator-async@0.1.0
  - @makotot/canopy-core@0.1.0
  - @makotot/canopy-reporter-mermaid@0.1.0
