---
'@makotot/canopy-annotator-suspense': minor
'@makotot/canopy-cli': minor
---

Suspense boundary detection is now available. Pass `--annotator suspense` to the CLI (or use `createSuspenseAnnotator` directly) to mark React `<Suspense>` boundaries in the render tree. Both `<Suspense>` (named import) and `<React.Suspense>` (member expression) are detected. Boundary nodes receive a yellow highlight in Mermaid output; locally-defined components named `Suspense` are not affected.
