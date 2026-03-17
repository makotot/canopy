# @makotot/canopy-annotator-context

## 0.2.0

### Minor Changes

- 35bd214: Adds `@makotot/canopy-annotator-context`, a new annotator that detects React Context providers and consumers in the render tree. Provider nodes are annotated with a `provides:ContextName` badge (green) and consumer nodes with a `consumes:ContextName` badge (purple). The annotator resolves custom hooks recursively, so `useAuth()` wrapping `useContext(AuthContext)` is detected correctly. Provider–consumer pairs are connected by dashed cross-edges in the Mermaid output, with each consumer linked to its nearest ancestor provider. Enable with `--annotator context`. This release also extends `@makotot/canopy-reporter-mermaid` with support for the new `meta.linkId` and `meta.crossLinks` convention fields that power the cross-edge rendering.
