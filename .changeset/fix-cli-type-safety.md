---
'@makotot/canopy-cli': patch
---

Replace the non-null assertion (`ANNOTATORS[name]!`) in `run` with a type guard that narrows validated annotator names to `AnnotatorName`, eliminating the unsafe `!` operator without changing runtime behaviour.
