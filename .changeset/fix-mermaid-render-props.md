---
'@makotot/canopy-reporter-mermaid': patch
---

Fix components passed as non-children props (e.g. `fallback={<Loading />}`) not appearing in the Mermaid flowchart output. These nodes are now rendered with an edge label showing the prop name (e.g. `-->|fallback|`).
