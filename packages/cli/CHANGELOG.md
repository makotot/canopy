# @makotot/canopy-cli

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
