# Meta Render Convention Design

- **Date**: 2026-03-14

## Overview

Annotators communicate with reporters via the `meta` field of `TreeNode`. Without a convention, reporters would need to know about each annotator by name (e.g. checking `meta.async`, `meta.client`), creating tight coupling between packages that are meant to be independently composable.

This document defines the **meta render convention**: a set of well-known field names that annotators write and reporters read, without either side knowing about the other's internals.

---

## Problem

Before this convention, `reporter-mermaid` contained logic like:

```ts
// tightly coupled — reporter knows about specific annotators
const badge = node.meta?.async ? ' [async]' : '';
```

Adding `client-boundary` support would have required:

```ts
const badge = node.meta?.async ? ' [async]' : node.meta?.client ? ' [client]' : '';
```

Every new annotator would require a reporter change. This is the wrong direction.

---

## Convention

Annotators that want to influence rendering **must** write to the following reserved fields in `meta`. Reporters read only these fields.

### `meta.badge`

**Type**: `string`
**Purpose**: Short label appended to the component name in the node.
**Rendered as**: `ComponentName [badge]`

```ts
// annotator-async sets:
meta: { badge: 'async' }

// annotator-client-boundary sets:
meta: { badge: 'client' }
```

### `meta.group`

**Type**: `string`
**Purpose**: Groups the component's subtree into a labeled `subgraph` block.
Only the first component with a given group name opens the subgraph; components already inside a group are not re-wrapped (no nested subgraphs).

```ts
// annotator-client-boundary sets:
meta: { group: 'client' }
```

### `meta.style`

**Type**: `{ fill: string; stroke: string }`
**Purpose**: Applies a background/border color to the node in the diagram.

```ts
// annotator-client-boundary sets:
meta: { style: { fill: '#dbeafe', stroke: '#93c5fd' } }
```

---

## Rules

**For annotator authors:**

- Use `meta.badge`, `meta.group`, `meta.style` to control rendering. Do NOT use other field names expecting them to be rendered.
- You may also write additional annotator-specific fields (e.g. `meta.async: true`, `meta.client: true`) for programmatic consumption by downstream tools — these are ignored by reporters.
- All three render fields are optional and independent. An annotator can set any combination.

**For reporter authors:**

- Read only `meta.badge`, `meta.group`, and `meta.style`. Do NOT read annotator-specific fields like `meta.async` or `meta.client`.
- Absence of a field means the feature is inactive — do not apply defaults.

---

## Example

An annotator that marks components as deprecated:

```ts
// annotator-deprecated sets:
meta: {
  deprecated: true,             // annotator-specific, ignored by reporters
  badge: 'deprecated',          // renders as [deprecated] label
  style: { fill: '#fee2e2', stroke: '#fca5a5' },  // red color
}
```

The reporter renders this correctly without any changes.

---

## Scope

This convention applies to `reporter-mermaid`. Future reporters (e.g. `reporter-json`) are not required to honor these fields — they may expose the full `meta` object as-is. The convention is specifically about visual rendering.
