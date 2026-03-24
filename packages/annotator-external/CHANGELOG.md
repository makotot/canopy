# @makotot/canopy-annotator-external

## 0.2.2

### Patch Changes

- 3f8f128: Move visual style mapping from annotators to reporter-mermaid. Annotators now only attach semantic tags to nodes; reporter-mermaid assigns colors from a built-in palette based on traversal order, cycling through colors deterministically. This removes the coupling between annotators and Mermaid-specific style details.

## 0.2.1

### Patch Changes

- Updated dependencies [f4f6613]
  - @makotot/canopy-core@0.4.1

## 0.2.0

### Minor Changes

- 648f4e7: Add `@makotot/canopy-annotator-external`, a new annotator that marks components imported from user-specified npm packages with a 📦 badge and light-blue highlight. Activate it with `--annotator external --external-packages "<pkg1>,<pkg2>"`, where each entry is an exact package name (e.g. `lucide-react`) or a scoped prefix (e.g. `@radix-ui`, which matches `@radix-ui/react-dialog` and any other package under that scope). Interactive mode prompts for package names when `external` is selected.

  The CLI's internal annotator wiring has been refactored: annotators are now assembled as pre-built factory functions before being passed to `run()`, which decouples annotator-specific options (such as `--external-packages`) from the runner and makes it straightforward to add further option-bearing annotators in future.
