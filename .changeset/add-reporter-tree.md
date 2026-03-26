---
'@makotot/canopy-reporter-tree': minor
'@makotot/canopy-cli': minor
---

Add `@makotot/canopy-reporter-tree` — a new reporter that renders the component tree as an ASCII tree printed to stdout. Use it with `--reporter tree` to inspect the component hierarchy without leaving the terminal.

Inline annotations (conditional rendering, async, client boundary, context provider/consumer, badges) are shown on a single line per node. `meta.group` is expressed as a virtual `(group-name)` intermediate node, and context cross-links are appended as a "Context Links" footer section.
