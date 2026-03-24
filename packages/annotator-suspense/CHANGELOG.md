# @makotot/canopy-annotator-suspense

## 0.3.2

### Patch Changes

- 3f8f128: Move visual style mapping from annotators to reporter-mermaid. Annotators now only attach semantic tags to nodes; reporter-mermaid assigns colors from a built-in palette based on traversal order, cycling through colors deterministically. This removes the coupling between annotators and Mermaid-specific style details.

## 0.3.1

### Patch Changes

- Updated dependencies [f4f6613]
  - @makotot/canopy-core@0.4.1

## 0.3.0

### Minor Changes

- c16da94: Introduce icon-based badge visualization and unified `meta.tags` field.

  **Breaking:** `meta.badge` type changed from `string` to `string[]`. Node labels in Mermaid output now render as `ComponentName<br/>icon` instead of `ComponentName [badge]`. Each annotator now writes an icon string into the badge array: `↻` (async), `⚡` (client), `⏳` (suspense), `◎` (context). Multiple annotators on the same node each append their icon, producing stacked lines.

  **Breaking:** Annotator-specific boolean flags (`meta.async`, `meta.client`, `meta.suspense`) and `meta.contextBadges` are removed. All semantic annotations are now consolidated into `meta.tags: string[]` (e.g. `['async']`, `['client']`, `['provides:AuthContext']`), enabling consistent programmatic consumption without per-annotator field checks.

  `@makotot/canopy-core` exports two new helpers — `appendBadge(meta, badge)` and `appendTag(meta, tag)` — that return only the target field (`{ badge: string[] }` / `{ tags: string[] }`) for safe spreading when building annotator meta objects.

### Patch Changes

- Updated dependencies [c16da94]
  - @makotot/canopy-core@0.4.0

## 0.2.0

### Minor Changes

- 73f8211: Suspense boundary detection is now available. Pass `--annotator suspense` to the CLI (or use `createSuspenseAnnotator` directly) to mark React `<Suspense>` boundaries in the render tree. Both `<Suspense>` (named import) and `<React.Suspense>` (member expression) are detected. Boundary nodes receive a yellow highlight in Mermaid output; locally-defined components named `Suspense` are not affected.
