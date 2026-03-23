# @makotot/canopy-reporter-mermaid

## 0.4.1

### Patch Changes

- Updated dependencies [f4f6613]
  - @makotot/canopy-core@0.4.1

## 0.4.0

### Minor Changes

- c16da94: Introduce icon-based badge visualization and unified `meta.tags` field.

  **Breaking:** `meta.badge` type changed from `string` to `string[]`. Node labels in Mermaid output now render as `ComponentName<br/>icon` instead of `ComponentName [badge]`. Each annotator now writes an icon string into the badge array: `↻` (async), `⚡` (client), `⏳` (suspense), `◎` (context). Multiple annotators on the same node each append their icon, producing stacked lines.

  **Breaking:** Annotator-specific boolean flags (`meta.async`, `meta.client`, `meta.suspense`) and `meta.contextBadges` are removed. All semantic annotations are now consolidated into `meta.tags: string[]` (e.g. `['async']`, `['client']`, `['provides:AuthContext']`), enabling consistent programmatic consumption without per-annotator field checks.

  `@makotot/canopy-core` exports two new helpers — `appendBadge(meta, badge)` and `appendTag(meta, tag)` — that return only the target field (`{ badge: string[] }` / `{ tags: string[] }`) for safe spreading when building annotator meta objects.

### Patch Changes

- Updated dependencies [c16da94]
  - @makotot/canopy-core@0.4.0

## 0.3.0

### Minor Changes

- 35bd214: Adds `@makotot/canopy-annotator-context`, a new annotator that detects React Context providers and consumers in the render tree. Provider nodes are annotated with a `provides:ContextName` badge (green) and consumer nodes with a `consumes:ContextName` badge (purple). The annotator resolves custom hooks recursively, so `useAuth()` wrapping `useContext(AuthContext)` is detected correctly. Provider–consumer pairs are connected by dashed cross-edges in the Mermaid output, with each consumer linked to its nearest ancestor provider. Enable with `--annotator context`. This release also extends `@makotot/canopy-reporter-mermaid` with support for the new `meta.linkId` and `meta.crossLinks` convention fields that power the cross-edge rendering.

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
