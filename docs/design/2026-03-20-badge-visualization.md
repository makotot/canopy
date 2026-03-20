# Design: Badge Visualization Enhancement

- **Date**: 2026-03-20

## Overview

`meta.badge` currently renders as `ComponentName [badge]` — a plain text suffix in brackets. This is hard to parse visually, especially when multiple annotators are active on the same node. This document defines a new rendering convention that replaces text badges with icon-based labels using `<br/>` line breaks.

---

## Problem

The current format appends the badge as bracketed text on the same line:

```
AsyncComponent [async]
ClientComponent [client]
```

When multiple annotators fire on the same node, it becomes a long single line:

```
AsyncClientComponent [async] [client]
```

There is no visual hierarchy. All annotations look the same regardless of their meaning.

---

## Solution

Use a per-annotator icon as the visual marker. Each annotation occupies its own line below the component name, separated by `<br/>`. The icon alone is sufficient for type-indicator annotators (async, client, suspense, context); the semantic annotator appends the ARIA role name because the role name itself is the information.

### Icon Assignment

| Annotator                   | Icon | Label format | Notes                                    |
| --------------------------- | ---- | ------------ | ---------------------------------------- |
| `annotator-async`           | ⚡   | `⚡`         | Icon alone is sufficient                 |
| `annotator-client-boundary` | ⬡    | `⬡`          | Icon alone is sufficient                 |
| `annotator-suspense`        | ⏳   | `⏳`         | Icon alone is sufficient                 |
| `annotator-context`         | ▶◀   | `▶◀`         | Icon alone is sufficient                 |
| `annotator-semantic`        | ♿   | `♿ <role>`  | Icon + role name (role name is the info) |

---

## Label Format

### Single annotator

```
ComponentName<br/>⚡
```

```
header<br/>♿ banner
```

### Multiple annotators

Each annotation on its own line:

```
ComponentName<br/>⚡<br/>⏳
```

```
AsyncComponent<br/>⚡<br/>♿ banner
```

### No annotation

Nodes not targeted by any active annotator retain their original label with no `<br/>`:

```
ComponentName
```

For `annotator-semantic`, `generic`, `presentation`, and `none` are treated as no annotation — no icon, no line break.

---

## Mermaid Output Examples

### async only

```
flowchart TD
  n0["Page"]
  n1["DataFetcher<br/>⚡"]
  n0 --> n1
```

### async + semantic

```
flowchart TD
  n0["Page"]
  n1["div"]
  n2["header<br/>♿ banner"]
  n3["AsyncNav<br/>⚡<br/>♿ navigation"]
  n0 --> n1
  n1 --> n2
  n2 --> n3
  style n1 fill:#...
```

---

## Changes Required

### `reporter-mermaid`

- Change node label construction to join annotations with `<br/>` instead of appending `[badge]`.
- `meta.badge` values are now rendered as `icon text` lines, not `[text]` suffixes.
- The reporter does not know about individual annotators — it reads `meta.badge` as-is and places it on a new line.

### Annotators

Each annotator writes `meta.badge` with the icon already included:

```ts
// annotator-async
meta.badge = '⚡';

// annotator-client-boundary
meta.badge = '⬡';

// annotator-suspense
meta.badge = '⏳';

// annotator-context (provider)
meta.badge = '▶◀';

// annotator-semantic
meta.badge = '♿ banner'; // icon + role name
// no badge for generic/presentation/none
```

### `meta-render-convention`

Update the `meta.badge` rendering definition:

- **Old**: `ComponentName [badge]`
- **New**: `ComponentName<br/>badge` (icon string placed on a new line)

When multiple annotators set `meta.badge`, the reporter concatenates them with `<br/>` in the order annotators were applied.

---

## Multi-Badge Aggregation

`meta.badge` is currently a single `string`. When multiple annotators are active, the reporter must aggregate all badge values.

Two options:

1. **Change `meta.badge` to `string[]`** — each annotator pushes its icon string; reporter joins with `<br/>`.
2. **Keep `meta.badge` as `string`, concatenate with `<br/>` at write time** — each annotator appends `\n<br/>icon` to the existing value.

**Decision**: Change `meta.badge` to `string[]`. This is cleaner, avoids string-manipulation bugs, and makes the reporter's join logic explicit. This is a breaking change to `meta-render-convention` and all annotators.

```ts
// TreeNode.meta
badge?: string[];  // was: badge?: string
```

```ts
// reporter-mermaid label construction
const badgeLines = node.meta?.badge ?? [];
const label =
  badgeLines.length > 0 ? `${node.component}<br/>${badgeLines.join('<br/>')}` : node.component;
```

---

## Packages Affected

| Package                                     | Change                                                                |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `@makotot/canopy-core`                      | `meta.badge` type: `string` → `string[]`                              |
| `@makotot/canopy-reporter-mermaid`          | Label construction: join badge array with `<br/>`                     |
| `@makotot/canopy-annotator-async`           | Write `['⚡']` instead of `'async'`                                   |
| `@makotot/canopy-annotator-client-boundary` | Write `['⬡']` instead of `'client'`                                   |
| `@makotot/canopy-annotator-suspense`        | Write `['⏳']` instead of `'suspense'`                                |
| `@makotot/canopy-annotator-context`         | Write `['▶◀']` instead of `'context'` / `'consumer'`                  |
| `@makotot/canopy-annotator-semantic`        | Write `['♿ <role>']`; skip badge for `generic`/`presentation`/`none` |
