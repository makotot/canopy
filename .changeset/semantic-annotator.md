---
'@makotot/canopy-core': minor
'@makotot/canopy-annotator-semantic': minor
'@makotot/canopy-cli': minor
---

Add `@makotot/canopy-annotator-semantic`, a new annotator that labels HTML elements in the render tree with their ARIA role as `meta.badge`. Elements with meaningful roles (anything other than `generic`, `presentation`, and `none`) receive a green style. Use with `canopy src/app/page.tsx --annotator semantic`.

To support attribute collection needed by the semantic annotator, `@makotot/canopy-core` adds `attrs?: Record<string, string>` to `TreeNode` and `attrsToCollect?: string[]` to `AnalyzeOptions`. **Breaking:** `@makotot/canopy-cli` migrates the annotator registry entries to a `{ create, requiredAttrs? }` shape so that annotators can declare which HTML attributes they need.
