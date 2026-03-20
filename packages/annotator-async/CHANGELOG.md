# @makotot/canopy-annotator-async

## 0.5.0

### Minor Changes

- c16da94: Introduce icon-based badge visualization and unified `meta.tags` field.

  **Breaking:** `meta.badge` type changed from `string` to `string[]`. Node labels in Mermaid output now render as `ComponentName<br/>icon` instead of `ComponentName [badge]`. Each annotator now writes an icon string into the badge array: `↻` (async), `⚡` (client), `⏳` (suspense), `◎` (context). Multiple annotators on the same node each append their icon, producing stacked lines.

  **Breaking:** Annotator-specific boolean flags (`meta.async`, `meta.client`, `meta.suspense`) and `meta.contextBadges` are removed. All semantic annotations are now consolidated into `meta.tags: string[]` (e.g. `['async']`, `['client']`, `['provides:AuthContext']`), enabling consistent programmatic consumption without per-annotator field checks.

  `@makotot/canopy-core` exports two new helpers — `appendBadge(meta, badge)` and `appendTag(meta, tag)` — that return only the target field (`{ badge: string[] }` / `{ tags: string[] }`) for safe spreading when building annotator meta objects.

### Patch Changes

- Updated dependencies [c16da94]
  - @makotot/canopy-core@0.4.0

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

## 0.3.0

### Minor Changes

- 1a4f11e: Added --component <name> option to specify which named exported component to analyze. Required when the file exports multiple components and has no default export.

### Patch Changes

- Updated dependencies [1a4f11e]
  - @makotot/canopy-core@0.3.0

## 0.2.0

### Minor Changes

- 6a9b4a5: Add optional project parameter to analyzeRenderTree and export createProject. Callers can now pass a shared Project instance to avoid repeated initialization overhead.

### Patch Changes

- Updated dependencies [6a9b4a5]
  - @makotot/canopy-core@0.2.0

## 0.1.0

### Minor Changes

- 1fcf0a1: Initial release of Canopy v0.1.0 — statically analyze React component render trees and visualize them as Mermaid flowcharts.

### Patch Changes

- Updated dependencies [1fcf0a1]
  - @makotot/canopy-core@0.1.0
