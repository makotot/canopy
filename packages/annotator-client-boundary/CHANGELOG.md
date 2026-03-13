# @makotot/canopy-annotator-client-boundary

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
