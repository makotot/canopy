# @makotot/canopy-core

## 0.3.0

### Minor Changes

- 1a4f11e: Added --component <name> option to specify which named exported component to analyze. Required when the file exports multiple components and has no default export.

## 0.2.0

### Minor Changes

- 6a9b4a5: Add optional project parameter to analyzeRenderTree and export createProject. Callers can now pass a shared Project instance to avoid repeated initialization overhead.

## 0.1.0

### Minor Changes

- 1fcf0a1: Initial release of Canopy v0.1.0 — statically analyze React component render trees and visualize them as Mermaid flowcharts.
