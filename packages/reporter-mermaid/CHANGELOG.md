# @makotot/canopy-reporter-mermaid

## 0.2.1

### Patch Changes

- d332209: Add `@makotot/canopy-reporter-mermaid` to render JSX props (non-children) as labeled edges in the Mermaid flowchart. Components passed via props such as `fallback={<Loading />}` now appear connected with the prop name as the edge label (e.g. `-->|fallback|`).

## 0.2.0

### Minor Changes

- 7d3c7ed: Annotators are now opt-in via `--annotator <name>`. Added `--annotator client-boundary` to detect RSC client
  boundaries.

  **Breaking (cli):** Async annotation no longer runs automatically. Use `--annotator async` to enable it.

  **New package:** `@makotot/canopy-annotator-client-boundary` — marks components in `"use client"` files and their
  transitive imports with `meta.client`, `meta.badge`, `meta.group`, and `meta.style`.

  **reporter-mermaid:** Rendering now driven by generic `meta.badge` / `meta.group` / `meta.style` fields. Components
  with `meta.group` are wrapped in a Mermaid `subgraph` block.

  **annotator-async:** Now sets `meta.badge: 'async'` alongside `meta.async: true`.

## 0.1.2

### Patch Changes

- Updated dependencies [1a4f11e]
  - @makotot/canopy-core@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [6a9b4a5]
  - @makotot/canopy-core@0.2.0

## 0.1.0

### Minor Changes

- 1fcf0a1: Initial release of Canopy v0.1.0 — statically analyze React component render trees and visualize them as Mermaid flowcharts.

### Patch Changes

- Updated dependencies [1fcf0a1]
  - @makotot/canopy-core@0.1.0
