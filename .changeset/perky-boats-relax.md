---
'@makotot/canopy-reporter-mermaid': patch
---

Add `@makotot/canopy-reporter-mermaid` to render JSX props (non-children) as labeled edges in the Mermaid flowchart. Components passed via props such as `fallback={<Loading />}` now appear connected with the prop name as the edge label (e.g. `-->|fallback|`).
