# @makotot/canopy-cli

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
