---
'@makotot/canopy-reporter-mermaid': minor
'@makotot/canopy-annotator-external': patch
'@makotot/canopy-annotator-client-boundary': patch
'@makotot/canopy-annotator-suspense': patch
'@makotot/canopy-annotator-context': patch
---

Move visual style mapping from annotators to reporter-mermaid. Annotators now only attach semantic tags to nodes; reporter-mermaid assigns colors from a built-in palette based on traversal order, cycling through colors deterministically. This removes the coupling between annotators and Mermaid-specific style details.
