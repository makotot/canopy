---
'@makotot/canopy-core': minor
'@makotot/canopy-reporter-mermaid': minor
'@makotot/canopy-annotator-async': minor
'@makotot/canopy-annotator-client-boundary': minor
'@makotot/canopy-annotator-suspense': minor
'@makotot/canopy-annotator-context': minor
---

Introduce icon-based badge visualization and unified `meta.tags` field.

**Breaking:** `meta.badge` type changed from `string` to `string[]`. Node labels in Mermaid output now render as `ComponentName<br/>icon` instead of `ComponentName [badge]`. Each annotator now writes an icon string into the badge array: `↻` (async), `⚡` (client), `⏳` (suspense), `◎` (context). Multiple annotators on the same node each append their icon, producing stacked lines.

**Breaking:** Annotator-specific boolean flags (`meta.async`, `meta.client`, `meta.suspense`) and `meta.contextBadges` are removed. All semantic annotations are now consolidated into `meta.tags: string[]` (e.g. `['async']`, `['client']`, `['provides:AuthContext']`), enabling consistent programmatic consumption without per-annotator field checks.

`@makotot/canopy-core` exports two new helpers — `appendBadge(meta, badge)` and `appendTag(meta, tag)` — that return only the target field (`{ badge: string[] }` / `{ tags: string[] }`) for safe spreading when building annotator meta objects.
